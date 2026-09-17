import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BILLING_PLANS, getOneTimePlanExpiry, getPlanPeriodMonths } from './plans'

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
    assert.equal(BILLING_PLANS['dzi-matura-6m'].amount, 12000)
    assert.equal(BILLING_PLANS['nvo-start-1m'].amount, 2999)
    assert.equal(BILLING_PLANS['nvo-serious-3m'].amount, 7999)
    assert.equal(BILLING_PLANS['nvo-exam-6m'].amount, 12000)
  })

  it('bills Бърз старт monthly and Сериозна подготовка every 3 months', () => {
    for (const key of ['dzi-start-1m', 'nvo-start-1m'] as const) {
      assert.equal(BILLING_PLANS[key].mode, 'subscription')
      assert.equal(BILLING_PLANS[key].billingIntervalMonths, 1)
    }
    for (const key of ['dzi-serious-3m', 'nvo-serious-3m'] as const) {
      assert.equal(BILLING_PLANS[key].mode, 'subscription')
      assert.equal(BILLING_PLANS[key].billingIntervalMonths, 3)
    }
  })

  it('keeps the 8-month tier a one-time payment', () => {
    for (const key of ['dzi-matura-6m', 'nvo-exam-6m'] as const) {
      assert.equal(BILLING_PLANS[key].mode, 'payment')
      assert.equal(BILLING_PLANS[key].accessMonths, 8)
      assert.equal(BILLING_PLANS[key].billingIntervalMonths, undefined)
    }
  })

  it('matches the effective monthly prices advertised on the landing page', () => {
    const effective = (key: 'dzi-start-1m' | 'dzi-serious-3m' | 'dzi-matura-6m') =>
      (BILLING_PLANS[key].amount / 100 / getPlanPeriodMonths(key)).toFixed(2)
    assert.equal(effective('dzi-start-1m'), '29.99')
    assert.equal(effective('dzi-serious-3m'), '26.66')
    assert.equal(effective('dzi-matura-6m'), '15.00')
  })

  it('expires the one-time 8-month plan 8 months after payment', () => {
    const from = new Date('2026-01-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('dzi-matura-6m', from), '2026-09-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('nvo-exam-6m', from), '2026-09-15T10:00:00.000Z')
  })

  it('clamps the expiry day into shorter target months', () => {
    // 31 Aug + 8 months lands on the last day of April.
    const from = new Date('2025-08-31T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('nvo-exam-6m', from), '2026-04-30T10:00:00.000Z')
  })

  it('leaves expiry to Stripe for subscription plans', () => {
    // Subscriptions renew until cancelled; the period end comes from the
    // Stripe subscription, not from a fixed local expiry.
    assert.equal(getOneTimePlanExpiry('dzi-start-1m'), null)
    assert.equal(getOneTimePlanExpiry('dzi-serious-3m'), null)
    assert.equal(getOneTimePlanExpiry('dzi-english-sprint'), null)
  })
})
