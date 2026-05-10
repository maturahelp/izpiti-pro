import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import path from 'node:path'
import { formatMathFallbackText, normalizeInlineMathDelimiters } from './math-text'

describe('formatMathFallbackText', () => {
  it('removes inline TeX delimiters and keeps arithmetic readable', () => {
    assert.equal(
      formatMathFallbackText('Пресметнете стойността на израза $4-3\\cdot 2$.'),
      'Пресметнете стойността на израза 4 − 3 · 2.',
    )
    assert.equal(formatMathFallbackText('$-2$'), '−2')
  })

  it('formats common generated math commands without exposing TeX syntax', () => {
    assert.equal(
      formatMathFallbackText('Кое е по-голямо: $\\frac{5}{8}$ или $\\frac{6}{10}$?'),
      'Кое е по-голямо: 5/8 или 6/10?',
    )
    assert.equal(formatMathFallbackText('$20\\%$ от $90$'), '20% от 90')
  })
})

describe('generated math problem bank fallback text', () => {
  it('formats the first rational-numbers question without visible dollar delimiters', () => {
    const bankPath = path.join(process.cwd(), 'data', 'nvo_7_math_generated_problem_bank.json')
    const bank = JSON.parse(readFileSync(bankPath, 'utf8'))
    const rationalSubtopic = bank.topics
      .flatMap((topic: { subtopics: Array<{ id: string; problems: Array<{ question: string; options: Record<string, string> }> }> }) => topic.subtopics)
      .find((subtopic: { id: string }) => subtopic.id === 'alg-rational')
    const firstProblem = rationalSubtopic.problems[0]

    assert.equal(
      formatMathFallbackText(firstProblem.question),
      'Пресметнете стойността на израза 4 − 3 · 2.',
    )
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(firstProblem.options).map(([label, value]) => [
          label,
          formatMathFallbackText(String(value)),
        ]),
      ),
      { А: '−2', Б: '10', В: '1', Г: '−4' },
    )
  })
})

describe('normalizeInlineMathDelimiters', () => {
  it('converts generated dollar-delimited inline math to MathJax default delimiters', () => {
    assert.equal(
      normalizeInlineMathDelimiters('Пресметнете $4-3\\cdot 2$.'),
      'Пресметнете \\(4-3\\cdot 2\\).',
    )
  })
})
