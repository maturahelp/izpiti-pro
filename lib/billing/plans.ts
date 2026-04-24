export type PlanKey = 'nvo-monthly' | 'nvo-full' | 'dzi-monthly' | 'dzi-full'

export type BillingPlanConfig = {
  name: string
  amount: number
  currency: string
  mode: 'payment' | 'subscription'
  class: '7' | '12'
  examPath: 'НВО' | 'ДЗИ'
  accessEndsAt?: string
}

export const BILLING_PLANS: Record<PlanKey, BillingPlanConfig> = {
  'nvo-monthly': {
    name: 'НВО Месечен план',
    amount: 3000,
    currency: 'eur',
    mode: 'subscription',
    class: '7',
    examPath: 'НВО',
  },
  'nvo-full': {
    name: 'НВО до края на изпитите',
    amount: 3000,
    currency: 'eur',
    mode: 'payment',
    class: '7',
    examPath: 'НВО',
    accessEndsAt: '2026-06-19T23:59:59.999+03:00',
  },
  'dzi-monthly': {
    name: 'ДЗИ Месечен план',
    amount: 3000,
    currency: 'eur',
    mode: 'subscription',
    class: '12',
    examPath: 'ДЗИ',
  },
  'dzi-full': {
    name: 'ДЗИ до края на матурите',
    amount: 1999,
    currency: 'eur',
    mode: 'payment',
    class: '12',
    examPath: 'ДЗИ',
    accessEndsAt: '2026-05-22T23:59:59.999+03:00',
  },
}

export function isPlanKey(value: string): value is PlanKey {
  return value in BILLING_PLANS
}

export function getOneTimePlanExpiry(planKey: PlanKey) {
  return BILLING_PLANS[planKey].accessEndsAt ?? null
}

export function buildPremiumProfilePatch(
  planKey: PlanKey,
  expiresAt: string | null,
  isActive = true
) {
  const config = BILLING_PLANS[planKey]

  return {
    plan: 'premium' as const,
    is_active: isActive,
    plan_expires_at: expiresAt,
    class: config.class,
    exam_path: config.examPath,
    updated_at: new Date().toISOString(),
  }
}
