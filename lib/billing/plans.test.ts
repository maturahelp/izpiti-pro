import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BILLING_PLANS, getOneTimePlanExpiry } from './plans'

describe('billing plans', () => {
  it('charges 9.99 EUR for the NVO 4 monthly plan', () => {
    assert.equal(BILLING_PLANS['nvo4-full'].amount, 999)
    assert.equal(BILLING_PLANS['nvo4-full'].currency, 'eur')
  })

  it('charges 19.99 EUR for the DZI full-access plan', () => {
    assert.equal(BILLING_PLANS['dzi-full'].amount, 1999)
    assert.equal(BILLING_PLANS['dzi-full'].currency, 'eur')
  })
  it('charges the tiered one-time prices for the DZI and NVO plans', () => {
    assert.equal(BILLING_PLANS['dzi-start-1m'].amount, 2999)
    assert.equal(BILLING_PLANS['dzi-serious-3m'].amount, 7999)
    assert.equal(BILLING_PLANS['dzi-matura-6m'].amount, 11999)
    assert.equal(BILLING_PLANS['nvo-start-1m'].amount, 2999)
    assert.equal(BILLING_PLANS['nvo-serious-3m'].amount, 7999)
    assert.equal(BILLING_PLANS['nvo-exam-6m'].amount, 11999)
  })

  it('matches the effective monthly prices advertised on the landing page', () => {
    const effective = (key: 'dzi-start-1m' | 'dzi-serious-3m' | 'dzi-matura-6m') => {
      const plan = BILLING_PLANS[key]
      return (plan.amount / 100 / (plan.accessMonths ?? 1)).toFixed(2)
    }
    assert.equal(effective('dzi-start-1m'), '29.99')
    assert.equal(effective('dzi-serious-3m'), '26.66')
    assert.equal(effective('dzi-matura-6m'), '20.00')
  })

  it('expires month-based one-time plans N months after payment', () => {
    const from = new Date('2026-01-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('dzi-start-1m', from), '2026-02-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('dzi-serious-3m', from), '2026-04-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('dzi-matura-6m', from), '2026-07-15T10:00:00.000Z')
  })

  it('clamps the expiry day into shorter target months', () => {
    const from = new Date('2026-01-31T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('nvo-start-1m', from), '2026-02-28T10:00:00.000Z')
  })

  it('returns null for plans without a period or an end date', () => {
    assert.equal(getOneTimePlanExpiry('dzi-english-sprint'), null)
  })
})
