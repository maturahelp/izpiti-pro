// Helpers for the official answer keys of the НВО/ДЗИ datasets.
//
// The keys were extracted from the MON PDFs where the "точки" column often
// got glued into the answer text ("Б 2", "Например: 3 ...", "... 2 т.").
// `cleanOfficialAnswerText` removes those artefacts without deleting real
// numbers that are part of the answer („На прощаване в 1868 г.“, „48 дни“,
// „тегло 12 т“). Callers normalise PDF glyphs first (see normalizeMathText in
// the exam renderer); these functions work on plain strings so they can be
// unit-tested without the React page.
//
// Note: JavaScript's `\b` only knows ASCII word characters, so it never
// matches next to Cyrillic letters — the patterns below use explicit
// whitespace/anchors instead.

// Letters and quotes that can surround a glued point value.
const WORD = 'А-Яа-яA-Za-z„“”«»'
// Point values that appear between words when the "точки" column was glued
// into the key: 1–6 for a single task, 0,5 for the НВО 4. клас keys.
const GLUED_POINTS = '(?:[1-6]|0,5)'

export function cleanOfficialAnswerText(text: string | undefined, questionType: string): string {
  if (!text) return ''
  let cleaned = text
    .replace(/^(Примерни отговори:)\s*\d+\s*/i, '$1 ')
    .replace(/^(Възможни отговори:)\s*\d+\s*/i, '$1 ')
    .replace(//g, '•')
    .replace(/_/g, ' ')
    // A total („Общо: 65“, „Общо 6 т.“) at the very end of the key.
    .replace(/(?:^|\s)(?:Общо|Всичко|общо):?\s*\d+(?:,\d+)?(?:\s*т\.?)?\s*$/i, '')
    // „4 точки“ / „2 т.“ (with the dot) is the points column — remove only that
    // token, the rest of the key may follow it („А) Йовков 6 т. Б) Димов…“).
    // „12 т“ without a dot (тона) is part of the answer, and so is a number in
    // running text („12 точки, от които“).
    .replace(/(^|\s)\d+(?:,\d+)?\s*точки?(?=$|\s|\))/gi, '$1')
    .replace(/(^|\s)\d+(?:,\d+)?\s*т\.(?![а-яa-z])/gi, '$1')
    // „А) 3 3 Б) 1“ → „А) 3 Б) 1“ (ДЗИ matching keys: the second digit is the points column)
    .replace(/([А-Я]\)\s*\d+)\s+\d+\s+(?=[А-Я]\))/g, '$1 ')
    // „... горо“ 4 Б) ...“ → the points column between two lettered answers
    .replace(/([^\d)])\s+\d+\s+(?=[А-Я]\))/g, '$1 ')
    // A lone small integer between two words is the points column
    // („защото 2 цитиране“); larger numbers are part of the answer.
    .replace(new RegExp(`([${WORD}])\\s+${GLUED_POINTS}\\s+(?=[${WORD}])`, 'g'), '$1 ')
    .replace(/^(Например:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/^(Примерни (?:насоки|посоки)(?: за размисъл)?:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/^(Възможни? отговори?:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/^(Възможен отговор:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    // A trailing number is the points column — unless it is the answer to a
    // lettered sub-question („В) 2“).
    .replace(/(?<![А-Я]\))\s+\d+(?:,\d+)?\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (questionType !== 'single_choice') {
    cleaned = cleaned
      .replace(new RegExp(`(?<=[${WORD}\\)])\\s+${GLUED_POINTS}\\s+(?=[а-яa-z])`, 'g'), ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }
  return cleaned
}

export function normalizeOpenAnswerText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/["„“”«»]/g, '')
    .replace(/[.,!?;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractAnswerAlternatives(cleaned: string): string[] {
  if (!cleaned) return []
  return cleaned
    .replace(/^Например:\s*/i, '')
    .replace(/^Възможни? отговори?:\s*/i, '')
    .replace(/^Възможен отговор:\s*/i, '')
    .split(/\s*\/\s*|\s*;\s*|\s+или\s+/i)
    .map((p) => normalizeOpenAnswerText(p))
    .filter(Boolean)
}

// Answers that cannot be checked by exact match: sample answers ("Примерни
// насоки"), explanations, and the long edited texts of the editing task.
const MANUAL_CHECK_MAX_LENGTH = 160

export function isManualCheckAnswer(cleaned: string): boolean {
  if (!cleaned) return true
  if (cleaned.length > MANUAL_CHECK_MAX_LENGTH) return true
  return /примерни|насоки|посоки|размисъл|докажете|редактирана|грешка|текстът|изречение|съчувствие|ролята на|например:/i.test(cleaned)
}

// Multi-part keys (`sub_answers`): numeric keys (НВО 4. клас математика, Q25)
// are compared by digits so "10 000" matches "10000"; text keys (the matching
// task 24 of НВО БЕЛ) accept any of the "/"-separated alternatives.
export function matchesSubAnswer(user: string, expected: string): boolean {
  const hasLetters = /[A-Za-zА-Яа-я]/.test(expected)
  if (!hasLetters) {
    // "10 000" → "10000"; several numbers are joined with ","
    const digitsFrom = (s: string) =>
      (s.replace(/(\d)\s+(?=\d)/g, '$1').match(/\d+/g) || []).join(',')
    const userDigits = digitsFrom(user)
    if (!userDigits) return false
    return expected.split(';').every((part) => {
      const expDigits = digitsFrom(part)
      if (!expDigits) return true
      return userDigits.includes(expDigits)
    })
  }

  const userNorm = normalizeOpenAnswerText(user)
  if (!userNorm) return false
  return expected
    .split(/\s*\/\s*/)
    .map((alt) => normalizeOpenAnswerText(alt))
    .filter(Boolean)
    .some((alt) => userNorm === alt || (alt.length >= 4 && userNorm.includes(alt)))
}
