import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { streamText, type CoreMessage } from 'ai'
import { z } from 'zod'

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AI_TUTOR_SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import { retrieveChunks, formatContextBlock } from '@/lib/ai/retrieve'
import { checkAndIncrementQuota } from '@/lib/ai/quota'

export const runtime = 'nodejs'
export const maxDuration = 60

const Body = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  grade: z.union([z.literal(7), z.literal(12)]).optional(),
})

const HISTORY_LIMIT = 10

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({ error: 'AI_NOT_CONFIGURED' }, { status: 500 })
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  let parsed: z.infer<typeof Body>
  try {
    parsed = Body.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }
  const { message, grade } = parsed

  const admin = createAdminClient()

  // 1. Квота — атомарно за безплатни.
  const quota = await checkAndIncrementQuota(admin, user.id)
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: 'QUOTA_EXCEEDED',
        message: 'Достигна седмичния лимит за безплатни въпроси. Надгради за неограничен достъп.',
        plan: quota.plan,
      },
      { status: 429 }
    )
  }

  // 2. Уверяваме се, че имаме разговор.
  let conversationId = parsed.conversationId
  if (conversationId) {
    const { data: existing } = await admin
      .from('ai_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!existing) conversationId = undefined
  }

  if (!conversationId) {
    const { data: created, error: createErr } = await admin
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: message.slice(0, 80),
      })
      .select('id')
      .single()
    if (createErr || !created) {
      console.error('[ai/chat] failed to create conversation', createErr)
      return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
    }
    conversationId = created.id as string
  }

  const conversationIdSafe: string = conversationId

  // 3. Зареждаме последните N съобщения за контекст.
  const { data: priorMessages } = await admin
    .from('ai_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationIdSafe)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  const history: CoreMessage[] = (priorMessages ?? [])
    .reverse()
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // 4. Записваме user съобщението сега, за да може frontend да го види при refresh.
  const { error: insertUserErr } = await admin.from('ai_messages').insert({
    conversation_id: conversationIdSafe,
    role: 'user',
    content: message,
  })
  if (insertUserErr) {
    console.error('[ai/chat] failed to persist user message', insertUserErr)
  }

  // 5. RAG: embed + retrieve top-K по pgvector. Класът от профила се
  //    използва като default филтър, ако клиентът не е изпратил grade.
  const effectiveGrade =
    grade ??
    (quota.studentClass === 7 || quota.studentClass === 12 ? quota.studentClass : undefined)
  const chunks = await retrieveChunks(admin, message, { grade: effectiveGrade, k: 6 })
  const contextBlock = formatContextBlock(chunks)

  // 6. Stream response от Gemini Flash.
  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: AI_TUTOR_SYSTEM_PROMPT,
    messages: [
      ...history,
      {
        role: 'user',
        content: `${contextBlock}\n\n---\n\nВЪПРОС НА УЧЕНИКА:\n${message}`,
      },
    ],
    temperature: 0.4,
    onFinish: async ({ text }) => {
      try {
        await admin.from('ai_messages').insert({
          conversation_id: conversationIdSafe,
          role: 'assistant',
          content: text,
        })
        await admin
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationIdSafe)
      } catch (err) {
        console.error('[ai/chat] failed to persist assistant message', err)
      }
    },
  })

  return result.toTextStreamResponse({
    headers: {
      'x-conversation-id': conversationIdSafe,
      'x-quota-remaining': String(quota.remaining ?? 'unlimited'),
      'x-plan': quota.plan,
    },
  })
}
