import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import path from 'node:path'

import { buildUnderlinedWordQuestion } from './underlined-word-question'

interface RawQuestion {
  number?: number
  question?: string
  options?: Record<string, string>
}

interface RawExam {
  id: string
  questions?: RawQuestion[]
}

function countSuspiciousUnderlineMarkers(fileName: string): number {
  const exams = JSON.parse(
    readFileSync(path.join(process.cwd(), 'data', fileName), 'utf8'),
  ) as RawExam[]
  let count = 0

  for (const exam of exams) {
    for (const question of exam.questions || []) {
      const fields = [
        question.question,
        ...Object.values(question.options || {}),
      ].filter(Boolean)
      const combined = fields.join(' ')

      if (
        /подчертан/i.test(combined) &&
        fields.some((field) => /\(\s*$/.test(String(field).trim()))
      ) {
        count += 1
      }
    }
  }

  return count
}

describe('buildUnderlinedWordQuestion', () => {
  it('reconstructs DZI underline marker fragments into a readable sentence and choices', () => {
    const model = buildUnderlinedWordQuestion({
      question: 'В коя от подчертаните думи е допусната граматична грешка? В изявлението му (',
      options: {
        'А': 'пред медиите режисьорът сподели, че камерният (',
        'Б': 'спектакъл с двамата известни актьори (',
        'В': 'жъне успехи на българските и световните (',
        'Г': 'театрални сцени.',
      },
    })

    assert.ok(model)
    assert.equal(
      model.prompt,
      'В коя от подчертаните думи е допусната граматична грешка?',
    )
    assert.equal(
      model.sentenceText,
      'В изявлението му пред медиите режисьорът сподели, че камерният спектакъл с двамата известни актьори жъне успехи на българските и световните театрални сцени.',
    )
    assert.deepEqual(model.choices, {
      'А': 'му',
      'Б': 'камерният',
      'В': 'актьори',
      'Г': 'световните',
    })
    assert.equal((model.sentenceHtml.match(/<u>/g) || []).length, 4)
  })

  it('detects DZI underline marker records and confirms NVO has none', () => {
    assert.equal(countSuspiciousUnderlineMarkers('official_dzi_bel_dataset.json'), 14)
    assert.equal(countSuspiciousUnderlineMarkers('official_quiz_dataset.json'), 0)
  })

  it('reconstructs DZI punctuation position markers into a readable sentence and position choices', () => {
    const model = buildUnderlinedWordQuestion({
      question: 'В коя от позициите, означени с букви, е допусната пунктуационна грешка? Психолозите съветват, че за да живеем спокойно и щастливо, (',
      options: {
        'А': 'трябва да спрем да се оплакваме, (',
        'Б': 'макар за много хора, (',
        'В': 'това да е почти невъзможно, (',
        'Г': 'тъй като все ще намерят повод да недоволстват.',
      },
    })

    assert.ok(model)
    assert.equal(
      model.prompt,
      'В коя от позициите, означени с букви, е допусната пунктуационна грешка?',
    )
    assert.deepEqual(model.choices, {
      'А': 'позиция А',
      'Б': 'позиция Б',
      'В': 'позиция В',
      'Г': 'позиция Г',
    })
    assert.match(model.sentenceHtml, /\(А\).*?\(Б\).*?\(В\).*?\(Г\)/)
    assert.doesNotMatch(model.sentenceHtml, /\(\s*$/)
    assert.doesNotMatch(model.sentenceText, /\(\s*$/)
    assert.equal((model.sentenceHtml.match(/<u>/g) || []).length, 0)
  })

  it('parses every affected DZI marker record', () => {
    const exams = JSON.parse(
      readFileSync(path.join(process.cwd(), 'data', 'official_dzi_bel_dataset.json'), 'utf8'),
    ) as RawExam[]
    const affectedQuestions = exams.flatMap((exam) =>
      (exam.questions || [])
        .map((question) => ({ examId: exam.id, question }))
        .filter(({ question }) => {
          const fields = [
            question.question,
            ...Object.values(question.options || {}),
          ].filter(Boolean)
          return fields.some((field) => /\(\s*$/.test(String(field).trim()))
        }),
    )

    assert.equal(affectedQuestions.length, 16)

    for (const { examId, question } of affectedQuestions) {
      const model = buildUnderlinedWordQuestion(question)

      assert.ok(model, `${examId} q${question.number} should parse`)
      assert.deepEqual(Object.keys(model.choices), ['А', 'Б', 'В', 'Г'])
      if (/подчертан/i.test(question.question || '')) {
        assert.equal((model.sentenceHtml.match(/<u>/g) || []).length, 4)
      } else {
        assert.match(model.sentenceHtml, /\(А\).*?\(Б\).*?\(В\).*?\(Г\)/)
      }
      assert.doesNotMatch(model.sentenceText, /\(\s*$/)
      assert.doesNotMatch(JSON.stringify(model.choices), /\(\s*"/)
    }
  })
})
