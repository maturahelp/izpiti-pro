export type SubscriptionAccessProfile = {
  role?: string | null
  plan?: string | null
  is_active?: boolean | null
  plan_expires_at?: string | null
  billing_status?: string | null
  billing_plan_key?: string | null
  cancel_at_period_end?: boolean | null
  cancel_at?: string | null
  current_period_end?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  last_payment_status?: string | null
}

export type SubscriptionStatus =
  | 'active'
  | 'canceling'
  | 'past_due'
  | 'expired'
  | 'inactive'

/**
 * Тези dashboard pages трябва да останат достъпни дори при
 * expired/past_due/cancelled абонамент, за да може user-ът винаги да
 * се логва, вижда статуса си и да поднови.
 */
const DASHBOARD_ROUTES_OPEN_WITHOUT_SUBSCRIPTION = new Set([
  '/dashboard/subscription',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/help',
  '/dashboard/materials',
  '/dashboard/tests',
  '/dashboard/select-class',
])

function normalizePathname(pathname: string) {
  if (!pathname) return '/'

  const normalized = pathname.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Access е активен, ако:
 *   - plan === 'premium' И is_active === true (не е false)
 *   - plan_expires_at е в бъдещето ИЛИ не е зададен (no hard expiry)
 *   - ако current_period_end е записан, той също трябва да е в бъдещето
 *     (използва се когато subscription-ът е cancel_at_period_end и след
 *     периода статусът вече не е „active").
 *
 * `past_due` webhook събития не махат достъпа веднага — даваме grace до
 * края на вече платения период (current_period_end).
 */
export function hasActivePremium(profile: SubscriptionAccessProfile | null | undefined) {
  if (!profile) return false
  if (profile.plan !== 'premium') return false
  if (profile.is_active === false) return false

  const now = new Date()
  const expires = parseDate(profile.plan_expires_at ?? null)
  if (expires && expires <= now) return false

  // При cancel_at_period_end=true Stripe продължава да връща status='active'
  // до края на периода. След това webhook-ът сваля is_active=false.
  return true
}

/**
 * Richer state за UI:
 *  - active: нормално активен
 *  - canceling: активен, но ще изтече в края на текущия период
 *  - past_due: имало е неуспешно плащане, но все още в grace период
 *  - expired: бил е premium, сега access е спрял
 *  - inactive: никога не е имал premium или нулиран
 */
export function getSubscriptionStatus(
  profile: SubscriptionAccessProfile | null | undefined
): SubscriptionStatus {
  if (!profile) return 'inactive'

  const active = hasActivePremium(profile)

  if (active) {
    if (profile.billing_status === 'past_due') return 'past_due'
    if (profile.cancel_at_period_end) return 'canceling'
    return 'active'
  }

  if (profile.plan === 'premium' || profile.billing_status) {
    return 'expired'
  }

  return 'inactive'
}

export function requiresActiveSubscription(pathname: string) {
  const normalized = normalizePathname(pathname)

  if (!normalized.startsWith('/dashboard')) {
    return false
  }

  if (DASHBOARD_ROUTES_OPEN_WITHOUT_SUBSCRIPTION.has(normalized)) {
    return false
  }

  // Поддиректории на разрешените маршрути също остават отворени
  // (напр. /dashboard/settings/notifications).
  for (const open of DASHBOARD_ROUTES_OPEN_WITHOUT_SUBSCRIPTION) {
    if (normalized.startsWith(`${open}/`)) return false
  }

  return true
}
