import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { requiresActiveSubscription } from './subscription-access'

describe('requiresActiveSubscription', () => {
  it('keeps progress available without premium access', () => {
    assert.equal(requiresActiveSubscription('/dashboard/progress'), false)
    assert.equal(requiresActiveSubscription('/dashboard/progress/weekly'), false)
  })

  it('continues to require premium for gated dashboard routes', () => {
    assert.equal(requiresActiveSubscription('/dashboard/literature-exercise/hudozhnik'), true)
  })
})
