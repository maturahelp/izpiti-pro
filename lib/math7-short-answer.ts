/**
 * Проверка на кратък отговор в банката по математика за 7. клас
 * (data/nvo_7_math_generated_problem_bank.json, type: "short_answer").
 *
 * Ключът в банката е записан за показване ($\frac{5}{3}$, „$x=5$ или $x=-9$“,
 * $\{2,3,4\}$, „да“). Ученикът пише в обикновено текстово поле, затова и
 * двете страни се свеждат до една и съща нормализирана форма:
 *  - $…$ / \(…\) и LaTeX командите се свалят до обикновен текст;
 *  - числата се сравняват като точни дроби: 5/3 = 1,(6) = 1.666…; 2,5 = 5/2;
 *  - мерните единици (cm, cm², лв., °) и „x=“ отпред се игнорират;
 *  - няколко стойности („x=5 или x=-9“, множества {2,3,4}) се сравняват без
 *    значение на реда;
 *  - за изрази редът на множителите и на събираемите не е от значение:
 *    (x+1)(x-1) = (x-1)(x+1), x^2+2x+1 = 1+2x+x^2.
 */

const UNIT_RE =
  /(?:\s|^)(?:cm|см|m|м|mm|мм|dm|дм|km|км|лв\.?|лева|лв|градуса|градус|gr|г)(?:\^?2|²|\^?3|³)?(?=\s|$|[;,)])/g

function latexToPlain(raw: string): string {
  let text = raw
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
    .replace(/\\\[([\s\S]*?)\\\]/g, '$1')

  let previous = ''
  while (previous !== text) {
    previous = text
    text = text.replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
  }

  return text
    .replace(/\\left|\\right/g, '')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\leq?(?![a-zA-Z])/g, '≤')
    .replace(/\\geq?(?![a-zA-Z])/g, '≥')
    .replace(/\\neq?(?![a-zA-Z])/g, '≠')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\^\\circ|\\circ|\\degree/g, '°')
    .replace(/\\lvert|\\rvert|\\vert/g, '|')
    .replace(/\\pi/g, 'π')
    .replace(/\\%/g, '%')
    .replace(/\\,|\\;|\\ /g, ' ')
    .replace(/\{,\}/g, ',')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\triangle/g, '△')
    .replace(/\\cong/g, '≅')
    .replace(/\\sim/g, '~')
    .replace(/\\[a-zA-Z]+/g, ' ')
}

/** Сваля LaTeX, уеднаквява знаци и маха единици; оставя малки букви. */
export function normalizeShortAnswerText(raw: string): string {
  return latexToPlain(raw || '')
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[×·⋅]/g, '*')
    .replace(/<=|=<|≤/g, '≤')
    .replace(/>=|=>|≥/g, '≥')
    .replace(/\s*°\s*/g, ' ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[„“”"«»']/g, '')
    .replace(UNIT_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]+$/, '')
}

const DIGIT_COMMA_RE = /(\d),(?=\d|\()/g

/** Опитва да прочете числото като точна дроб [числител, знаменател]; null за нечислов текст. */
export function parseExactNumber(token: string): [number, number] | null {
  let s = token.replace(/\s+/g, '').replace(/^\((.*)\)$/, '$1')
  // "x=5", "x1=5", "x_2 = -9"
  s = s.replace(/^[a-zа-я](?:_?\d)?=/, '')
  s = s.replace(/^\+/, '')
  if (!s) return null

  const sign = s.startsWith('-') ? -1 : 1
  if (s.startsWith('-')) s = s.slice(1)

  const withSign = (num: number, den: number): [number, number] => reduce(sign * num, den)

  // periodic decimal 1,(6)  /  0,1(23)
  const periodic = s.match(/^(\d+)[.,](\d*)\((\d+)\)$/)
  if (periodic) {
    const [, intPart, nonRep, rep] = periodic
    const scale = 10 ** nonRep.length
    const repScale = 10 ** rep.length - 1
    const num = Number(intPart) * scale * repScale + Number(nonRep + rep || '0') - Number(nonRep || '0')
    return withSign(num, scale * repScale)
  }

  const decimal = s.match(/^(\d+)[.,](\d+)$/)
  if (decimal) {
    const [, intPart, frac] = decimal
    const scale = 10 ** frac.length
    return withSign(Number(intPart) * scale + Number(frac), scale)
  }

  const fraction = s.match(/^\(?(\d+)\)?\/\(?(\d+)\)?$/)
  if (fraction) {
    const den = Number(fraction[2])
    if (den === 0) return null
    return withSign(Number(fraction[1]), den)
  }

  if (/^\d+$/.test(s)) return withSign(Number(s), 1)
  return null
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

function reduce(num: number, den: number): [number, number] {
  const g = gcd(num, den) || 1
  return [num / g, den / g]
}

function canonicalExpression(token: string): string {
  let s = token.replace(/\s+/g, '').replace(/\*/g, '')
  s = s.replace(/^[a-zа-я](?:_?\d)?=/, '')
  // (x+1)^2 → (x+1)(x+1)
  s = s.replace(/(\([^()]*\))\^2/g, '$1$1')
  const sortTerms = (expr: string) => {
    const terms = expr.match(/[+-]?[^+-]+/g) || [expr]
    return terms
      .map((t) => (t.startsWith('+') ? t.slice(1) : t))
      .sort()
      .join('+')
      .replace(/\+-/g, '-')
  }
  const factors = s.match(/\([^()]*\)|[^()]+/g)
  if (!factors || factors.length <= 1) {
    return sortTerms(s)
  }
  return factors
    .map((f) => (f.startsWith('(') ? `(${sortTerms(f.slice(1, -1))})` : sortTerms(f)))
    .sort()
    .join('')
}

/** Една стойност → каноничен низ (дроб p/q или нормализиран израз). */
export function canonicalToken(token: string): string {
  const t = token.trim()
  if (!t) return ''
  const num = parseExactNumber(t)
  if (num) return `${num[0]}/${num[1]}`
  return canonicalExpression(t)
}

/** Разбива „x=5 или x=-9“, „5; -9“, „{2,3,4}“ на отделни стойности. */
export function splitAnswerParts(normalized: string): string[] {
  let s = normalized
  const isSet = /[{}]/.test(s)
  if (isSet) {
    s = s.replace(/[{}]/g, '')
    return s.split(/[,;]|\sи\s|\sили\s/).map((p) => p.trim()).filter(Boolean)
  }
  // decimal comma must survive the split: 2,5 → 2.5 and 1,(6) → 1.(6)
  s = s.replace(DIGIT_COMMA_RE, '$1.')
  return s
    .split(/;|,|\sили\s|\sи\s/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function canonicalAnswer(raw: string): string {
  const normalized = normalizeShortAnswerText(raw)
  if (!normalized) return ''
  const parts = splitAnswerParts(normalized).map(canonicalToken).filter(Boolean)
  if (!parts.length) return ''
  return parts.sort().join(';')
}

/**
 * Сравнява отговора на ученика с ключа и с допълнителните приети форми.
 * Връща true при съвпадение на нормализираните стойности.
 */
export function checkShortAnswer(input: string, correctAnswer: string, acceptedAnswers?: string[]): boolean {
  const given = canonicalAnswer(input)
  if (!given) return false
  const expected = [correctAnswer, ...(acceptedAnswers || [])]
  return expected.some((candidate) => canonicalAnswer(candidate) === given)
}
