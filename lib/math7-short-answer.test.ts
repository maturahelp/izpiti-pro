import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import problemBank from '@/data/nvo_7_math_generated_problem_bank.json'
import { canonicalAnswer, checkShortAnswer, parseExactNumber } from './math7-short-answer'

describe('math7 short answer — numbers', () => {
  it('reads integers, decimals, fractions and periodic decimals as exact values', () => {
    assert.deepEqual(parseExactNumber('42'), [42, 1])
    assert.deepEqual(parseExactNumber('-4'), [-4, 1])
    assert.deepEqual(parseExactNumber('2,5'), [5, 2])
    assert.deepEqual(parseExactNumber('2.5'), [5, 2])
    assert.deepEqual(parseExactNumber('5/3'), [5, 3])
    assert.deepEqual(parseExactNumber('(5)/(3)'), [5, 3])
    assert.deepEqual(parseExactNumber('1,(6)'), [5, 3])
    assert.deepEqual(parseExactNumber('-1,(3)'), [-4, 3])
    assert.deepEqual(parseExactNumber('0,1(6)'), [1, 6])
    assert.deepEqual(parseExactNumber('x=5'), [5, 1])
    assert.equal(parseExactNumber('x+1'), null)
  })

  it('accepts equivalent numeric forms of the key', () => {
    assert.equal(checkShortAnswer('42', '$42$'), true)
    assert.equal(checkShortAnswer(' 42 ', '$42$'), true)
    assert.equal(checkShortAnswer('42 cm', '$42$'), true)
    assert.equal(checkShortAnswer('72 cm²', '$72$'), true)
    assert.equal(checkShortAnswer('72 cm^2', '$72$'), true)
    assert.equal(checkShortAnswer('104 лв.', '$104$'), true)
    assert.equal(checkShortAnswer('80°', '$80$'), true)
    assert.equal(checkShortAnswer('−4', '$-4$'), true)
    assert.equal(checkShortAnswer('1/5', '$\\frac{1}{5}$'), true)
    assert.equal(checkShortAnswer('2/10', '$\\frac{1}{5}$'), true)
    assert.equal(checkShortAnswer('0,2', '$\\frac{1}{5}$'), true)
    assert.equal(checkShortAnswer('0.2', '$\\frac{1}{5}$'), true)
    assert.equal(checkShortAnswer('17/20', '$\\frac{17}{20}$'), true)
    assert.equal(checkShortAnswer('0,85', '$\\frac{17}{20}$'), true)
    assert.equal(checkShortAnswer('43', '$42$'), false)
    assert.equal(checkShortAnswer('', '$42$'), false)
  })

  it('accepts 5/3 and 1,(6) style equivalents', () => {
    assert.equal(checkShortAnswer('5/3', '$\\frac{5}{3}$'), true)
    assert.equal(checkShortAnswer('1,(6)', '$\\frac{5}{3}$'), true)
    assert.equal(checkShortAnswer('1.(6)', '$\\frac{5}{3}$'), true)
    assert.equal(checkShortAnswer('1,67', '$\\frac{5}{3}$'), false)
  })
})

describe('math7 short answer — several values', () => {
  it('accepts the roots of |x+2|=7 in any order and format', () => {
    const key = '$x=5$ или $x=-9$'
    assert.equal(checkShortAnswer('5 или -9', key), true)
    assert.equal(checkShortAnswer('-9; 5', key), true)
    assert.equal(checkShortAnswer('x=5, x=-9', key), true)
    assert.equal(checkShortAnswer('x1=5 x2=-9'.replace(' ', '; '), key), true)
    assert.equal(checkShortAnswer('5 и −9', key), true)
    assert.equal(checkShortAnswer('5', key), false)
    assert.equal(checkShortAnswer('5 или 9', key), false)
  })

  it('accepts decimal roots with a comma', () => {
    const key = '$x=2{,}5$ или $x=-0{,}5$'
    assert.equal(checkShortAnswer('2,5 и -0,5', key), true)
    assert.equal(checkShortAnswer('-0.5; 2.5', key), true)
    assert.equal(checkShortAnswer('5/2 или -1/2', key), true)
  })

  it('compares sets without regard to order', () => {
    assert.equal(checkShortAnswer('{2,3,4}', '$\\{2,3,4\\}$'), true)
    assert.equal(checkShortAnswer('{4; 3; 2}', '$\\{2,3,4\\}$'), true)
    assert.equal(checkShortAnswer('2, 3, 4', '$\\{2,3,4\\}$'), true)
    assert.equal(checkShortAnswer('{2,3}', '$\\{2,3,4\\}$'), false)
  })
})

describe('math7 short answer — expressions and inequalities', () => {
  it('ignores the order of factors and terms', () => {
    assert.equal(checkShortAnswer('(x+1)(x-1)', '$(x-1)(x+1)$'), true)
    assert.equal(checkShortAnswer('(x-1)*(x+1)', '$(x-1)(x+1)$'), true)
    assert.equal(checkShortAnswer('(x+1)^2', '$(x+1)^2$'), true)
    assert.equal(checkShortAnswer('(x+1)(x+1)', '$(x+1)^2$'), true)
    assert.equal(checkShortAnswer('(1+x)^2', '$(x+1)^2$'), true)
    assert.equal(checkShortAnswer('7x(x+1)', '$7x(x+1)$'), true)
    assert.equal(checkShortAnswer('(x+1)7x', '$7x(x+1)$'), true)
    assert.equal(checkShortAnswer('(y+1)(x+8)', '$(x+8)(y+1)$'), true)
    assert.equal(checkShortAnswer('1+2x+x^2', '$x^2+2x+1$'), true)
    assert.equal(checkShortAnswer('x²+2x+1', '$x^2+2x+1$'), true)
    assert.equal(checkShortAnswer('6x - 6', '$6x-6$'), true)
    assert.equal(checkShortAnswer('-6+6x', '$6x-6$'), true)
    assert.equal(checkShortAnswer('6x+6', '$6x-6$'), false)
    assert.equal(checkShortAnswer('15x', '$15x$'), true)
  })

  it('accepts the usual ways to type ≤ and >', () => {
    assert.equal(checkShortAnswer('x<=2', '$x\\le 2$'), true)
    assert.equal(checkShortAnswer('x ≤ 2', '$x\\le 2$'), true)
    assert.equal(checkShortAnswer('x>-3', '$x>-3$'), true)
    assert.equal(checkShortAnswer('x > −3', '$x>-3$'), true)
    assert.equal(checkShortAnswer('3<x<19', '$3<x<19$'), true)
    assert.equal(checkShortAnswer('x<2', '$x\\le 2$'), false)
  })

  it('compares words case-insensitively and honours acceptedAnswers', () => {
    assert.equal(checkShortAnswer('Да', 'да'), true)
    assert.equal(checkShortAnswer('да.', 'да'), true)
    assert.equal(checkShortAnswer('не', 'да'), false)
    assert.equal(checkShortAnswer('Съставно число', 'съставно', ['съставно', 'съставно число']), true)
    assert.equal(checkShortAnswer('трети', '3', ['3', 'трети', 'III']), true)
    assert.equal(checkShortAnswer('2', '3', ['3', 'трети', 'III']), false)
  })
})

describe('math7 short answer — the bank itself', () => {
  type Problem = { id: string; type: string; correctAnswer: string; acceptedAnswers?: string[]; options: Record<string, string> | null }
  const problems = (problemBank.topics as Array<{ subtopics: Array<{ problems: Problem[] }> }>)
    .flatMap((t) => t.subtopics.flatMap((s) => s.problems))

  it('every short answer key matches itself and its plain-text form', () => {
    for (const p of problems) {
      if (p.type !== 'short_answer') continue
      assert.ok(canonicalAnswer(p.correctAnswer), `${p.id}: key normalises to nothing (${p.correctAnswer})`)
      assert.equal(checkShortAnswer(p.correctAnswer, p.correctAnswer, p.acceptedAnswers), true, p.id)
      const plain = p.correctAnswer.replace(/\$/g, '')
      assert.equal(checkShortAnswer(plain, p.correctAnswer, p.acceptedAnswers), true, `${p.id}: ${plain}`)
    }
  })

  it('multiple-choice tasks have four distinct options with the key among them and mixed letters', () => {
    const letters: Record<string, number> = {}
    for (const p of problems) {
      if (!p.options) continue
      const values = Object.values(p.options)
      assert.equal(new Set(values).size, 4, `${p.id}: duplicate options`)
      const letter = Object.entries(p.options).find(([, v]) => v === p.correctAnswer)?.[0]
      assert.ok(letter, `${p.id}: key is not an option`)
      letters[letter] = (letters[letter] || 0) + 1
    }
    for (const letter of ['А', 'Б', 'В', 'Г']) {
      assert.ok((letters[letter] || 0) >= 60, `letter ${letter} is the key in only ${letters[letter] || 0} tasks`)
    }
  })
})
