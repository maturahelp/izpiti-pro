import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { requiresActiveSubscription } from './subscription-access'

describe('requiresActiveSubscription', () => {
  it('keeps the free-tier dashboard routes open without a plan', () => {
    for (const path of [
      '/dashboard/materials',
      '/dashboard/tests',
      '/dashboard/progress',
      '/dashboard/subscription',
      '/dashboard/ai',
      '/dashboard/progress/',
    ]) {
      assert.equal(requiresActiveSubscription(path), false, path)
    }
  })

  it('still requires a plan for routes that are not whitelisted', () => {
    assert.equal(requiresActiveSubscription('/dashboard/some-premium-page'), true)
  })

  it('ignores non-dashboard paths', () => {
    assert.equal(requiresActiveSubscription('/'), false)
    assert.equal(requiresActiveSubscription('/login'), false)
  })
})
