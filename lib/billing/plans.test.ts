import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BILLING_PLANS } from './plans'

describe('billing plans', () => {
  it('charges 9.99 EUR for the NVO 4 monthly plan', () => {
    assert.equal(BILLING_PLANS['nvo4-full'].amount, 999)
    assert.equal(BILLING_PLANS['nvo4-full'].currency, 'eur')
  })

  it('charges 9.99 EUR for the DZI full-access plan', () => {
    assert.equal(BILLING_PLANS['dzi-full'].amount, 999)
    assert.equal(BILLING_PLANS['dzi-full'].currency, 'eur')
  })
})
