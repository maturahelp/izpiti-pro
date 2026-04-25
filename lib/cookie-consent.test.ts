import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_VERSION,
  createAcceptedAllCookieConsent,
  createDefaultCookieConsent,
  getCookieConsentCookieAttributes,
  parseCookieConsent,
  serializeCookieConsent,
} from './cookie-consent'

describe('cookie consent helpers', () => {
  it('creates the default preferences for a new visitor', () => {
    assert.deepEqual(createDefaultCookieConsent(), {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: '',
    })
  })

  it('creates an accept-all payload', () => {
    assert.deepEqual(createAcceptedAllCookieConsent('2026-04-25T19:05:00.000Z'), {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: '2026-04-25T19:05:00.000Z',
    })
  })

  it('serializes and parses a stored consent payload', () => {
    const updatedAt = '2026-04-25T19:05:00.000Z'
    const raw = serializeCookieConsent({
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: true,
      marketing: false,
      updatedAt,
    })

    assert.deepEqual(parseCookieConsent(raw), {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: true,
      marketing: false,
      updatedAt,
    })
  })

  it('rejects malformed or incompatible cookie payloads', () => {
    assert.equal(parseCookieConsent('not-json'), null)
    assert.equal(
      parseCookieConsent(
        serializeCookieConsent({
          version: 'old-version',
          essential: true,
          analytics: true,
          marketing: true,
          updatedAt: '2026-04-25T19:05:00.000Z',
        })
      ),
      null
    )
  })

  it('exports stable cookie metadata', () => {
    assert.equal(COOKIE_CONSENT_COOKIE_NAME, 'mh_cookie_consent')
    assert.equal(
      getCookieConsentCookieAttributes(),
      'Max-Age=15552000; Path=/; SameSite=Lax'
    )
  })
})
