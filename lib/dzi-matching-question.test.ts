import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import mockPracticeDataset from '@/data/mock_exam_practice.json'
import { literatureWorks } from '@/data/literatureWorks'
import {
  buildDziMatchingQuestionModel,
  normalizeLiteratureTitle,
} from './dzi-matching-question'

describe('DZI matching question helpers', () => {
  it('builds four labeled answer fields and deterministic author numbers', () => {
    const model = buildDziMatchingQuestionModel({
      '„Железният светилник“': 'Димитър Талев',
      '„Бай Ганьо журналист“': 'Алеко Константинов',
      '„Балкански синдром“': 'Станислав Стратиев',
      '„Балада за Георг Хених“': 'Виктор Пасков',
    })

    assert.deepEqual(
      model.prompts.map((item) => ({ label: item.label, title: item.title })),
      [
        { label: 'А', title: '„Железният светилник“' },
        { label: 'Б', title: '„Бай Ганьо журналист“' },
        { label: 'В', title: '„Балкански синдром“' },
        { label: 'Г', title: '„Балада за Георг Хених“' },
      ],
    )

    assert.deepEqual(
      model.authors.map((item) => ({ number: item.number, author: item.author })),
      [
        { number: '1', author: 'Алеко Константинов' },
        { number: '2', author: 'Виктор Пасков' },
        { number: '3', author: 'Димитър Талев' },
        { number: '4', author: 'Станислав Стратиев' },
      ],
    )

    assert.deepEqual(model.answerKey, {
      'А': '3',
      'Б': '1',
      'В': '4',
      'Г': '2',
    })
  })

  it('keeps all mock DZI question 39 works within the canonical DZI literature list', () => {
    const allowedTitles = new Set(
      literatureWorks.map((work) => normalizeLiteratureTitle(work.title)),
    )

    const invalidTitles = (mockPracticeDataset.exams || [])
      .filter((exam) => exam.exam_type === 'dzi_bel')
      .flatMap((exam) =>
        (exam.questions || [])
          .filter((question) => question.number === 39 && question.pairs)
          .flatMap((question) =>
            Object.keys(question.pairs || {}).filter(
              (title) => !allowedTitles.has(normalizeLiteratureTitle(title)),
            ),
          ),
      )

    assert.deepEqual(invalidTitles, [])
  })
})
