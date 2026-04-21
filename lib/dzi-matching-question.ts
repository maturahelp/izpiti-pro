const BULGARIAN_LABELS = ['А', 'Б', 'В', 'Г', 'Д', 'Е'] as const

export interface DziMatchingPrompt {
  label: string
  title: string
  author: string
  expectedNumber: string
}

export interface DziMatchingAuthorOption {
  number: string
  author: string
}

export interface DziMatchingQuestionModel {
  prompts: DziMatchingPrompt[]
  authors: DziMatchingAuthorOption[]
  answerKey: Record<string, string>
}

export function normalizeLiteratureTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[„“"«»]/g, '')
    .replace(/[.!?;:,()[\]{}]/g, ' ')
    .replace(/…/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeMatchingResponse(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[„“"«»]/g, '')
    .replace(/[.!?;:,()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compareBulgarianText(a: string, b: string): number {
  return a.localeCompare(b, 'bg', { sensitivity: 'base' })
}

export function buildDziMatchingQuestionModel(pairs: Record<string, string>): DziMatchingQuestionModel {
  const entries = Object.entries(pairs || {}).slice(0, 4)

  const authors = Array.from(new Set(entries.map(([, author]) => author)))
    .sort(compareBulgarianText)
    .map((author, index) => ({
      number: String(index + 1),
      author,
    }))

  const authorToNumber = new Map(authors.map((entry) => [entry.author, entry.number] as const))

  const prompts = entries.map(([title, author], index) => ({
    label: BULGARIAN_LABELS[index] || String(index + 1),
    title,
    author,
    expectedNumber: authorToNumber.get(author) || '',
  }))

  return {
    prompts,
    authors,
    answerKey: Object.fromEntries(prompts.map((prompt) => [prompt.label, prompt.expectedNumber])),
  }
}

export function buildDziMatchingAnswerGuide(model: DziMatchingQuestionModel): string {
  return [
    'Верни съответствия:',
    ...model.prompts.map((prompt) => `${prompt.label}) ${prompt.expectedNumber} — ${prompt.author}`),
  ].join('\n')
}

export function evaluateDziMatchingQuestion(
  model: DziMatchingQuestionModel,
  responses: Record<string, string>,
): 'empty' | 'correct' | 'incorrect' {
  const labels = model.prompts.map((prompt) => prompt.label)
  const filledLabels = labels.filter((label) => (responses[label] || '').trim())
  if (!filledLabels.length) return 'empty'

  const allFilled = labels.every((label) => (responses[label] || '').trim())
  if (!allFilled) return 'incorrect'

  return model.prompts.every((prompt) => {
    const response = normalizeMatchingResponse(responses[prompt.label] || '')
    return response === prompt.expectedNumber || response === normalizeMatchingResponse(prompt.author)
  })
    ? 'correct'
    : 'incorrect'
}
