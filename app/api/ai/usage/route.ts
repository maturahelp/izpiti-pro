import { NextResponse } from 'next/server'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { readQuota } from '@/lib/ai/quota'

export const runtime = 'nodejs'

export async function GET() {
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

  const admin = createAdminClient()

  const [quota, recent] = await Promise.all([
    readQuota(admin, user.id),
    admin
      .from('ai_messages')
      .select('content, created_at, conversation_id, ai_conversations!inner(user_id)')
      .eq('role', 'user')
      .eq('ai_conversations.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const recentQuestions = (recent.data ?? [])
    .map((row) => (row.content ?? '').trim())
    .filter((q) => q.length > 0)

  return NextResponse.json({
    plan: quota.plan,
    remaining: quota.remaining,
    recentQuestions: recentQuestions.slice(0, 4),
  })
}
