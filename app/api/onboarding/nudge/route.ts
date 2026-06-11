import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueEmailAutomationJob } from '@/lib/email-automation/jobs'
import { hasActivePremium } from '@/lib/subscription-access'

export const runtime = 'nodejs'

/**
 * POST /api/onboarding/nudge
 *
 * Called after a user selects their grade during registration.
 * Queues the appropriate no-purchase nudge email based on the user's class.
 * Safe to call multiple times — dedupe_key prevents duplicate sends.
 */
export async function POST() {
  const supabase = await createServerClient()
  if (!supabase) return NextResponse.json({ error: 'SUPABASE_UNAVAILABLE' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, class, plan, is_active, plan_expires_at, billing_plan_key, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 })
  }

  // Don't queue if admin or already premium
  if (profile.role === 'admin' || hasActivePremium(profile)) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const userClass = profile.class

  if (userClass === '7') {
    await queueEmailAutomationJob({
      userId: user.id,
      email: user.email ?? null,
      templateKey: 'nvo7_urgency_nudge',
      // Send 30 minutes after registration — gives time to explore the platform first
      scheduledFor: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      dedupeKey: `nvo7-urgency-onboarding:${user.id}`,
      payload: { source: 'profiles-trigger', class_snapshot: '7' },
    })
    return NextResponse.json({ ok: true, queued: 'nvo7_urgency_nudge' })
  }

  if (userClass === '12') {
    await queueEmailAutomationJob({
      userId: user.id,
      email: user.email ?? null,
      templateKey: 'grade12_no_purchase_nudge',
      // Send 1 hour after registration
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      dedupeKey: `grade12-nudge-onboarding:${user.id}`,
      payload: { source: 'profiles-trigger', class_snapshot: '12' },
    })
    return NextResponse.json({ ok: true, queued: 'grade12_no_purchase_nudge' })
  }

  return NextResponse.json({ ok: true, skipped: true, reason: 'no_nudge_for_class' })
}
