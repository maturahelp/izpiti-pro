import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DEFAULT_MARKETING_EXAM_TAB,
  getMarketingExamTabFromBrowser,
  resolveMarketingExamTab,
} from './marketing-exam-tab'

describe('marketing exam tab defaults', () => {
  it('defaults new visitors to the NVO7 track', () => {
    assert.equal(DEFAULT_MARKETING_EXAM_TAB, 'nvo7')
    assert.equal(resolveMarketingExamTab(null), 'nvo7')
    assert.equal(resolveMarketingExamTab(''), 'nvo7')
  })

  it('maps saved or linked class choices to the matching marketing tab', () => {
    assert.equal(resolveMarketingExamTab('4'), 'nvo4')
    assert.equal(resolveMarketingExamTab('7'), 'nvo7')
    assert.equal(resolveMarketingExamTab('12'), 'dzi12')
  })

  it('uses explicit browser class hints before stored values', () => {
    const previousWindow = (globalThis as { window?: unknown }).window

    ;(globalThis as { window?: unknown }).window = {
      location: { search: '?class=4' },
      localStorage: {
        getItem: (key: string) => (key === 'grade' ? '12' : null),
      },
    }

    try {
      assert.equal(getMarketingExamTabFromBrowser(), 'nvo4')
    } finally {
      ;(globalThis as { window?: unknown }).window = previousWindow
    }
  })
})
