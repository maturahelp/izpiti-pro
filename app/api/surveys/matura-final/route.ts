import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import {
  MATURA_FINAL_CAMPAIGN_KEY,
  MATURA_FINAL_CHECKOUT_REDIRECT,
  MATURA_FINAL_DISCOUNT_CODE,
  buildMaturaFinalLoginHref,
  isMaturaFinalBlocker,
  isMaturaFinalHelpNeed,
  isMaturaFinalStartTrigger,
} from '@/lib/campaigns/matura-final-survey'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown
    blocker?: unknown
    helpNeed?: unknown
    startTrigger?: unknown
    freeText?: unknown
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const blocker = typeof body.blocker === 'string' ? body.blocker.trim() : ''
  const helpNeed = typeof body.helpNeed === 'string' ? body.helpNeed.trim() : ''
  const startTrigger = typeof body.startTrigger === 'string' ? body.startTrigger.trim() : ''
  const freeText =
    typeof body.freeText === 'string' ? body.freeText.trim().slice(0, 500) : ''

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 })
  }

  if (!isMaturaFinalBlocker(blocker)) {
    return NextResponse.json({ error: 'INVALID_BLOCKER' }, { status: 400 })
  }

  if (!isMaturaFinalHelpNeed(helpNeed)) {
    return NextResponse.json({ error: 'INVALID_HELP_NEED' }, { status: 400 })
  }

  if (!isMaturaFinalStartTrigger(startTrigger)) {
    return NextResponse.json({ error: 'INVALID_START_TRIGGER' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    let matchedUserId: string | null = null
    let classSnapshot: string | null = null
    let planSnapshot: string | null = null

    const supabase = await createSupabaseServerClient()
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.id && user.email?.trim().toLowerCase() === email) {
        matchedUserId = user.id

        const { data: profile } = await admin
          .from('profiles')
          .select('class, plan')
          .eq('id', user.id)
          .maybeSingle<{ class: string | null; plan: string | null }>()

        classSnapshot = profile?.class ?? null
        planSnapshot = profile?.plan ?? null
      }
    }

    const { error } = await admin.from('campaign_survey_responses').upsert(
      {
        campaign_key: MATURA_FINAL_CAMPAIGN_KEY,
        email,
        user_id: matchedUserId,
        blocker_key: blocker,
        help_need_key: helpNeed,
        start_trigger_key: startTrigger,
        free_text: freeText || null,
        discount_code: MATURA_FINAL_DISCOUNT_CODE,
        source: 'matura-9-dni-page',
        class_snapshot: classSnapshot,
        plan_snapshot: planSnapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'campaign_key,email' }
    )

    if (error) {
      console.error('[matura-final-survey] upsert failed', error)
      return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      discountCode: MATURA_FINAL_DISCOUNT_CODE,
      loginHref: buildMaturaFinalLoginHref(),
      checkoutRedirect: MATURA_FINAL_CHECKOUT_REDIRECT,
      matchedAuthenticatedUser: Boolean(matchedUserId),
    })
  } catch (error) {
    console.error('[matura-final-survey] unexpected error', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
