export type PlanKey =
  | 'nvo4-full'
  | 'nvo-full'
  | 'nvo-sprint'
  | 'nvo-start-1m'
  | 'nvo-serious-3m'
  | 'nvo-exam-6m'
  | 'dzi-full'
  | 'dzi-sprint'
  | 'dzi-english-sprint'
  | 'dzi-start-1m'
  | 'dzi-serious-3m'
  | 'dzi-matura-6m'

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
  /** Фиксирана крайна дата на достъпа (напр. „до матурата на 22 май“). */
  accessEndsAt?: string
  /**
   * Относителен достъп в месеци от момента на плащането. Използва се от
   * one-time плановете с период. Ако е зададено заедно с `accessEndsAt`,
   * печели по-ранната от двете дати.
   */
  accessMonths?: number
  /**
   * Дължина на един платен период за `mode: 'subscription'`, в месеци.
   * Stripe получава `recurring: { interval: 'month', interval_count: N }`,
   * т.е. сумата се удържа автоматично на всеки N месеца до отказ.
   * Незададено при месечните планове означава 1.
   */
  billingIntervalMonths?: number
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
  },
  'nvo-sprint': {
    name: 'Лятна подготовка НВО',
    amount: 999,
    currency: 'eur',
    mode: 'subscription',
    class: '7',
    examPath: 'НВО',
    aiDailyLimit: 10,
  },
  'dzi-full': {
    name: 'ДЗИ — месечен достъп',
    amount: 1999,
    currency: 'eur',
    mode: 'subscription',
    class: '12',
    examPath: 'ДЗИ',
  },
  'dzi-sprint': {
    name: 'Лятна подготовка ДЗИ',
    amount: 999,
    currency: 'eur',
    mode: 'subscription',
    class: '12',
    examPath: 'ДЗИ',
  },
  'dzi-english-sprint': {
    name: 'Интензивен английски',
    amount: 499,
    currency: 'eur',
    mode: 'payment',
    class: '12',
    examPath: 'ДЗИ',
    accessScope: 'english',
  },

  // ── Тарифни планове (12. клас ДЗИ) ──────────────────────────────────────
  // „Бърз старт“ и „Сериозна подготовка“ са абонаменти — сумата се удържа
  // автоматично на всеки 1 / 3 месеца, докато ученикът не откаже. „До
  // матурата“ остава еднократно плащане за 8 месеца достъп. Ефективната
  // месечна цена пада с дължината на периода.
  'dzi-start-1m': {
    name: 'ДЗИ Бърз старт — месечен абонамент',
    amount: 2999,
    currency: 'eur',
    mode: 'subscription',
    class: '12',
    examPath: 'ДЗИ',
    billingIntervalMonths: 1,
  },
  'dzi-serious-3m': {
    name: 'ДЗИ Сериозна подготовка — абонамент на 3 месеца',
    amount: 7999,
    currency: 'eur',
    mode: 'subscription',
    class: '12',
    examPath: 'ДЗИ',
    billingIntervalMonths: 3,
  },
  // Ключът е исторически (планът стартира като 6-месечен); не го
  // преименувай — съществуващи профили го имат в billing_plan_key.
  'dzi-matura-6m': {
    name: 'ДЗИ До матурата — 8 месеца',
    amount: 12000,
    currency: 'eur',
    mode: 'payment',
    class: '12',
    examPath: 'ДЗИ',
    accessMonths: 8,
  },

  // ── Тарифни планове (7. клас НВО) ───────────────────────────────────────
  'nvo-start-1m': {
    name: 'НВО Бърз старт — месечен абонамент',
    amount: 2999,
    currency: 'eur',
    mode: 'subscription',
    class: '7',
    examPath: 'НВО',
    billingIntervalMonths: 1,
  },
  'nvo-serious-3m': {
    name: 'НВО Сериозна подготовка — абонамент на 3 месеца',
    amount: 7999,
    currency: 'eur',
    mode: 'subscription',
    class: '7',
    examPath: 'НВО',
    billingIntervalMonths: 3,
  },
  // Ключът е исторически (виж dzi-matura-6m).
  'nvo-exam-6m': {
    name: 'НВО До изпита — 8 месеца',
    amount: 12000,
    currency: 'eur',
    mode: 'payment',
    class: '7',
    examPath: 'НВО',
    accessMonths: 8,
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

/**
 * Добавя `months` календарни месеца към `from`, като клампва деня надолу,
 * когато целевият месец е по-къс (31 януари + 1 месец → 28/29 февруари).
 */
function addMonths(from: Date, months: number): Date {
  const target = new Date(from.getTime())
  const day = target.getUTCDate()
  target.setUTCDate(1)
  target.setUTCMonth(target.getUTCMonth() + months)
  const lastDayOfTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate()
  target.setUTCDate(Math.min(day, lastDayOfTargetMonth))
  return target
}

/**
 * Крайна дата на достъпа за one-time план.
 *  - `accessEndsAt`  → фиксирана дата
 *  - `accessMonths`  → `from` + N месеца
 * Ако и двете са зададени, връща по-ранната (достъпът не надживява изпита).
 */
export function getOneTimePlanExpiry(planKey: PlanKey, from: Date = new Date()) {
  const config = BILLING_PLANS[planKey]
  const fixed = config.accessEndsAt ?? null
  const relative =
    typeof config.accessMonths === 'number'
      ? addMonths(from, config.accessMonths).toISOString()
      : null

  if (fixed && relative) return fixed < relative ? fixed : relative
  return fixed ?? relative
}

/**
 * Дължина на платения период в месеци — интервалът на абонамента или
 * срокът на достъпа при еднократните планове. Използва се за
 * „ефективно на месец“ цената, показвана на landing page-а.
 */
export function getPlanPeriodMonths(planKey: PlanKey): number {
  const config = BILLING_PLANS[planKey]
  if (config.mode === 'subscription') return config.billingIntervalMonths ?? 1
  return config.accessMonths ?? 1
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
