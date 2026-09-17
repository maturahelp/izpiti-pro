import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BILLING_PLANS,
  getOneTimePlanExpiry,
  getPlanPeriodMonths,
  isPlanKey,
  isPurchasablePlanKey,
} from './plans'

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

  it('keeps the 6-month tier a one-time payment', () => {
    for (const key of ['dzi-matura-6m', 'nvo-exam-6m'] as const) {
      assert.equal(BILLING_PLANS[key].mode, 'payment')
      assert.equal(BILLING_PLANS[key].accessMonths, 6)
      assert.equal(BILLING_PLANS[key].billingIntervalMonths, undefined)
    }
  })

  it('matches the effective monthly prices advertised on the landing page', () => {
    const effective = (key: 'dzi-start-1m' | 'dzi-serious-3m' | 'dzi-matura-6m') =>
      (BILLING_PLANS[key].amount / 100 / getPlanPeriodMonths(key)).toFixed(2)
    assert.equal(effective('dzi-start-1m'), '29.99')
    assert.equal(effective('dzi-serious-3m'), '26.66')
    assert.equal(effective('dzi-matura-6m'), '20.00')
  })

  it('expires the one-time 6-month plan 6 months after payment', () => {
    const from = new Date('2026-01-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('dzi-matura-6m', from), '2026-07-15T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('nvo-exam-6m', from), '2026-07-15T10:00:00.000Z')
  })

  it('clamps the expiry day into shorter target months', () => {
    // 31 Aug + 6 months lands on the last day of February.
    const from = new Date('2025-08-31T10:00:00.000Z')
    assert.equal(getOneTimePlanExpiry('nvo-exam-6m', from), '2026-02-28T10:00:00.000Z')
  })

  it('retires the legacy plans so they cannot be bought again', () => {
    const legacy = ['nvo-full', 'nvo-sprint', 'dzi-full', 'dzi-sprint', 'dzi-english-sprint']
    for (const key of legacy) {
      // Остават валидни ключове (съществуващи абонати ги имат в профила си)…
      assert.equal(isPlanKey(key), true, key)
      // …но не могат да се купят наново.
      assert.equal(isPurchasablePlanKey(key), false, key)
    }
  })

  it('keeps the current plans purchasable', () => {
    const current = [
      'nvo4-full',
      'nvo-start-1m',
      'nvo-serious-3m',
      'nvo-exam-6m',
      'dzi-start-1m',
      'dzi-serious-3m',
      'dzi-matura-6m',
    ]
    for (const key of current) {
      assert.equal(isPurchasablePlanKey(key), true, key)
    }
    assert.equal(isPurchasablePlanKey('not-a-plan'), false)
  })

  it('points the live campaign links at purchasable plans', async () => {
    const { MATURA_FINAL_CHECKOUT_PLAN, MATURA_FINAL_CHECKOUT_REDIRECT } = await import(
      '../campaigns/matura-final-survey'
    )
    assert.equal(isPurchasablePlanKey(MATURA_FINAL_CHECKOUT_PLAN), true)
    assert.match(MATURA_FINAL_CHECKOUT_REDIRECT, /plan=dzi-start-1m&/)
  })

  it('leaves expiry to Stripe for subscription plans', () => {
    // Subscriptions renew until cancelled; the period end comes from the
    // Stripe subscription, not from a fixed local expiry.
    assert.equal(getOneTimePlanExpiry('dzi-start-1m'), null)
    assert.equal(getOneTimePlanExpiry('dzi-serious-3m'), null)
    assert.equal(getOneTimePlanExpiry('dzi-english-sprint'), null)
  })
})
