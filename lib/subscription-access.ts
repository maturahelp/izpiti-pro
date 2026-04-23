export type SubscriptionAccessProfile = {
  role?: string | null
  plan?: string | null
  is_active?: boolean | null
  plan_expires_at?: string | null
}

export type SubscriptionStatus = 'active' | 'expired' | 'inactive'

const DASHBOARD_ROUTES_OPEN_WITHOUT_SUBSCRIPTION = new Set([
  '/dashboard/subscription',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/help',
  '/dashboard/materials',
  '/dashboard/tests',
])

function normalizePathname(pathname: string) {
  if (!pathname) return '/'

  const normalized = pathname.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

export function hasActivePremium(profile: SubscriptionAccessProfile | null | undefined) {
  if (profile?.plan !== 'premium' || profile?.is_active === false) {
    return false
  }

  if (!profile.plan_expires_at) {
    return true
  }

  const expiresAt = new Date(profile.plan_expires_at)
  if (Number.isNaN(expiresAt.getTime())) {
    return false
  }

  return expiresAt > new Date()
}

export function getSubscriptionStatus(
  profile: SubscriptionAccessProfile | null | undefined
): SubscriptionStatus {
  if (hasActivePremium(profile)) {
    return 'active'
  }

  if (profile?.plan === 'premium') {
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

  return true
}
