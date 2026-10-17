import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { tests } from '@/data/tests'
import { nvoLiteratureWorks } from '@/data/nvoLiteratureWorks'
import { nvoLiteratureWorkTextPaths } from '@/data/nvoLiteratureWorkTexts'
import { FREE_MOCK_EXAM_IDS, isFreeMockExam } from './free-content'

describe('free content whitelist', () => {
  it('free mock exams exist in the test catalog', () => {
    for (const id of Object.values(FREE_MOCK_EXAM_IDS)) {
      assert.ok(tests.some((test) => test.id === id), `missing ${id} in data/tests.ts`)
      assert.equal(isFreeMockExam(id), true)
    }
    assert.equal(isFreeMockExam('mock_nvo_bel_02'), false)
  })

  it('every NVO literature work has a text file registered', () => {
    for (const work of nvoLiteratureWorks) {
      assert.ok(nvoLiteratureWorkTextPaths[work.id], `no text path for ${work.id} (${work.title})`)
    }
  })
})
