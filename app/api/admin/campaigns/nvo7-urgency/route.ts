import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueEmailAutomationJob } from '@/lib/email-automation/jobs'
import { hasActivePremium } from '@/lib/subscription-access'

export const runtime = 'nodejs'

/**
 * POST /api/admin/campaigns/nvo7-urgency
 *
 * Queues the `nvo7_urgency_nudge` email for every grade-7 user
 * who does not yet have an active premium plan.
 * Safe to run multiple times — dedupe_key prevents duplicate sends.
 */
export async function POST() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const admin = createAdminClient()

  // Fetch all grade 7 profiles
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, plan, is_active, plan_expires_at, billing_plan_key, role')
    .eq('class', '7')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const now = new Date().toISOString()
  let queued = 0
  let skipped = 0
  const errors: string[] = []

  for (const profile of profiles ?? []) {
    // Skip admins and already-premium users
    if (profile.role === 'admin') { skipped++; continue }
    if (hasActivePremium(profile)) { skipped++; continue }

    try {
      await queueEmailAutomationJob({
        userId: profile.id,
        templateKey: 'nvo7_urgency_nudge',
        scheduledFor: now,
        dedupeKey: `nvo7-urgency-campaign-jun2026:${profile.id}`,
        payload: { source: 'bulk-campaign', class_snapshot: '7' },
      })
      queued++
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null
          ? JSON.stringify(err)
          : String(err)
      // Skip duplicate inserts silently (already queued/sent)
      if (!msg.includes('23505')) {
        errors.push(`${profile.id}: ${msg}`)
      } else {
        skipped++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    queued,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  })
}
