export const LEGAL_VERSION = '2026-04-18'
export const LEGAL_PROVIDER = 'MaturaHelp'
export const LEGAL_SUPPORT_EMAIL = 'support@maturahelp.bg'
export const LEGAL_UPDATED_AT_BG = '18.04.2026'

export type BillingPeriod = 'monthly' | 'yearly'

export interface RegistrationConsentInput {
  acceptedTermsPrivacy: boolean
  confirmedAge14: boolean
  marketingEmails: boolean
  userAgent?: string
}

export interface RegistrationConsentMetadata {
  legal_version: string
  consent_context: 'registration'
  accepted_terms_privacy: boolean
  confirmed_age_14: boolean
  marketing_emails: boolean
  immediate_access_acknowledged: boolean
  auto_renew_notice_shown: boolean
  consent_user_agent: string
}

export function getBrowserUserAgent() {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent
}

export function buildRegistrationConsentMetadata(input: RegistrationConsentInput): RegistrationConsentMetadata {
  return {
    legal_version: LEGAL_VERSION,
    consent_context: 'registration',
    accepted_terms_privacy: input.acceptedTermsPrivacy,
    confirmed_age_14: input.confirmedAge14,
    marketing_emails: input.marketingEmails,
    immediate_access_acknowledged: false,
    auto_renew_notice_shown: false,
    consent_user_agent: input.userAgent ?? '',
  }
}

export function getNextPaymentDate(baseDate: Date, billingPeriod: BillingPeriod) {
  const nextDate = new Date(baseDate.getTime())

  if (billingPeriod === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1)
    return nextDate
  }

  nextDate.setMonth(nextDate.getMonth() + 1)
  return nextDate
}

export function formatBgDate(date: Date) {
  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
