import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { BILLING_PLANS, isPlanKey, getOneTimePlanExpiry, type PlanKey } from '@/lib/billing/plans'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { id } = await params
  const body = await req.json().catch(() => ({})) as {
    planKey?: PlanKey | string | null
    customExpiry?: string
  }

  const planKey = body.planKey && isPlanKey(body.planKey) ? body.planKey : null
  const customExpiry = body.customExpiry?.trim() || null

  let expiresAt: string | null = null
  if (customExpiry) {
    const d = new Date(customExpiry)
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'INVALID_DATE' }, { status: 400 })
    }
    // End-of-day
    d.setHours(23, 59, 59, 999)
    expiresAt = d.toISOString()
  } else if (planKey) {
    expiresAt = getOneTimePlanExpiry(planKey) ?? null
  }

  if (!planKey && !customExpiry) {
    return NextResponse.json({ error: 'MISSING_PLAN_OR_EXPIRY' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const admin = createAdminClient()

  const patch: Record<string, unknown> = {
    plan: 'premium',
    is_active: true,
    plan_expires_at: expiresAt,
    billing_status: 'manual',
    billing_plan_key: planKey,
    current_period_end: expiresAt,
    cancel_at_period_end: false,
    cancel_at: null,
    updated_at: now,
  }

  if (planKey) {
    const config = BILLING_PLANS[planKey]
    patch.class = config.class
    patch.exam_path = config.examPath
  }

  const { error } = await admin.from('profiles').update(patch).eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, expiresAt, planKey })
}
