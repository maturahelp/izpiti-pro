export type PlanKey =
  | 'nvo4-full'
  | 'nvo-full'
  | 'nvo-sprint'
  | 'dzi-full'
  | 'dzi-sprint'
  | 'dzi-english-sprint'

/**
 * `accessScope` определя кои dashboard секции отключва плана:
 *  - 'full'    → всички материали и тестове за съответния клас
 *  - 'english' → САМО английския раздел (DZI English content)
 */
export type AccessScope = 'full' | 'english'

export type BillingPlanConfig = {
  name: string
  amount: number
  currency: string
  mode: 'payment' | 'subscription'
  class: '4' | '7' | '12'
  examPath: 'НВО' | 'ДЗИ'
  accessEndsAt?: string
  accessScope?: AccessScope
  // null = неограничено, число = дневен лимит за AI чат.
  aiDailyLimit?: number | null
}

export const BILLING_PLANS: Record<PlanKey, BillingPlanConfig> = {
  'nvo4-full': {
    name: 'НВО 4. клас — месечен достъп',
    amount: 999,
    currency: 'eur',
    mode: 'subscription',
    class: '4',
    examPath: 'НВО',
  },
  'nvo-full': {
    name: 'НВО до края на изпитите',
    amount: 1999,
    currency: 'eur',
    mode: 'payment',
    class: '7',
    examPath: 'НВО',
    accessEndsAt: '2026-06-19T23:59:59.999+03:00',
  },
  'nvo-sprint': {
    name: 'Финален спринт НВО',
    amount: 999,
    currency: 'eur',
    mode: 'payment',
    class: '7',
    examPath: 'НВО',
    accessEndsAt: '2026-06-19T23:59:59.999+03:00',
    aiDailyLimit: 10,
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
  'dzi-sprint': {
    name: 'Спринт до ДЗИ',
    amount: 999,
    currency: 'eur',
    mode: 'payment',
    class: '12',
    examPath: 'ДЗИ',
    accessEndsAt: '2026-05-22T23:59:59.999+03:00',
  },
  'dzi-english-sprint': {
    name: 'Интензивен английски',
    amount: 499,
    currency: 'eur',
    mode: 'payment',
    class: '12',
    examPath: 'ДЗИ',
    accessEndsAt: '2026-05-23T23:59:59.999+03:00',
    accessScope: 'english',
  },
}

export function getPlanAccessScope(planKey: PlanKey | null | undefined): AccessScope {
  if (!planKey) return 'full'
  return BILLING_PLANS[planKey]?.accessScope ?? 'full'
}

/**
 * Връща дневния AI лимит за активен платен план.
 * `null` = неограничен, число = брой съобщения / 24h.
 * За планове без `aiDailyLimit` (full плановете) → null.
 */
export function getPlanAiDailyLimit(planKey: PlanKey | null | undefined): number | null {
  if (!planKey) return null
  const limit = BILLING_PLANS[planKey]?.aiDailyLimit
  return limit === undefined ? null : limit
}

export function isPlanKey(value: string): value is PlanKey {
  return value in BILLING_PLANS
}

export function getOneTimePlanExpiry(planKey: PlanKey) {
  return BILLING_PLANS[planKey].accessEndsAt ?? null
}

export function isOneTimePlan(planKey: PlanKey) {
  return BILLING_PLANS[planKey].mode === 'payment'
}

export function isRecurringPlan(planKey: PlanKey) {
  return BILLING_PLANS[planKey].mode === 'subscription'
}

/**
 * Profile patch, приложен след успешно плащане или актуален subscription
 * update. При деактивация (isActive=false) пак презаписваме class/exam_path,
 * за да останат сензорите консистентни със closely-coupled grade lock логиката.
 */
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
    billing_plan_key: planKey,
    updated_at: new Date().toISOString(),
  }
}
