export const COOKIE_CONSENT_COOKIE_NAME = 'mh_cookie_consent'
export const COOKIE_CONSENT_VERSION = '2026-04-25'
export const COOKIE_CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

export interface CookieConsentState {
  version: string
  essential: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

export function createDefaultCookieConsent(): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics: false,
    marketing: false,
    updatedAt: '',
  }
}

export function createAcceptedAllCookieConsent(updatedAt: string): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics: true,
    marketing: true,
    updatedAt,
  }
}

export function serializeCookieConsent(value: CookieConsentState) {
  return encodeURIComponent(JSON.stringify(value))
}

export function parseCookieConsent(raw: string | null | undefined): CookieConsentState | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsentState>

    if (
      parsed.version !== COOKIE_CONSENT_VERSION ||
      parsed.essential !== true ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null
    }

    return {
      version: parsed.version,
      essential: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

export function getCookieConsentCookieAttributes() {
  return `Max-Age=${COOKIE_CONSENT_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
}

export function isCookieConsentGranted(
  consent: CookieConsentState | null | undefined,
  category: 'essential' | 'analytics' | 'marketing'
) {
  if (!consent) return false
  return consent[category]
}
