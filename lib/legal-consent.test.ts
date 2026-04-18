import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  LEGAL_VERSION,
  buildRegistrationConsentMetadata,
  getNextPaymentDate,
} from './legal-consent'

describe('legal consent helpers', () => {
  it('uses the approved legal version date', () => {
    assert.equal(LEGAL_VERSION, '2026-04-18')
  })

  it('builds registration metadata with required and optional consent flags', () => {
    const metadata = buildRegistrationConsentMetadata({
      acceptedTermsPrivacy: true,
      confirmedAge14: true,
      marketingEmails: false,
      userAgent: 'Unit Test Browser',
    })

    assert.deepEqual(metadata, {
      legal_version: '2026-04-18',
      consent_context: 'registration',
      accepted_terms_privacy: true,
      confirmed_age_14: true,
      marketing_emails: false,
      immediate_access_acknowledged: false,
      auto_renew_notice_shown: false,
      consent_user_agent: 'Unit Test Browser',
    })
  })

  it('calculates the next payment date from the selected billing period', () => {
    const baseDate = new Date('2026-04-18T09:00:00.000Z')

    assert.equal(getNextPaymentDate(baseDate, 'monthly').toISOString(), '2026-05-18T09:00:00.000Z')
    assert.equal(getNextPaymentDate(baseDate, 'yearly').toISOString(), '2027-04-18T09:00:00.000Z')
  })
})
