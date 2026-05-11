export interface UnderlinedWordQuestionInput {
  question?: string
  options?: Record<string, string>
}

export interface UnderlinedWordQuestionModel {
  prompt: string
  sentenceHtml: string
  sentenceText: string
  choices: Record<string, string>
}

const CHOICE_LABELS = ['А', 'Б', 'В', 'Г'] as const
const MARKED_OPTION_LABELS = ['А', 'Б', 'В'] as const
const POSITION_MARKER_RE = /позициите,\s*означени с букви/i

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeSentenceSpacing(text: string): string {
  return text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function parseMarkedFragment(fragment: string): { html: string; text: string; choice: string } | null {
  const withoutMarker = fragment.replace(/\s*\(\s*$/, '').trim()
  const match = withoutMarker.match(/^(.*?)([^\s,.;:!?()]+)\s*$/u)

  if (!match) return null

  const [, prefix, choice] = match

  return {
    html: `${escapeHtml(prefix)}<u>${escapeHtml(choice)}</u>`,
    text: withoutMarker,
    choice,
  }
}

function parsePositionFragment(fragment: string, label: string): { html: string; text: string } {
  const withoutMarker = fragment.replace(/\s*\(\s*$/, '').trim()
  return {
    html: `${escapeHtml(withoutMarker)} <strong>(${label})</strong>`,
    text: `${withoutMarker} (${label})`,
  }
}

export function buildUnderlinedWordQuestion(
  input: UnderlinedWordQuestionInput,
): UnderlinedWordQuestionModel | null {
  const { question = '', options } = input

  if (!options || (!/подчертаните думи/i.test(question) && !POSITION_MARKER_RE.test(question))) return null

  const questionMarkIndex = question.indexOf('?')
  if (questionMarkIndex === -1) return null

  const prompt = question.slice(0, questionMarkIndex + 1).trim()
  const firstFragment = question.slice(questionMarkIndex + 1).trim()
  const markedFragments = [
    firstFragment,
    ...MARKED_OPTION_LABELS.map((label) => options[label] || ''),
  ]

  if (
    !markedFragments.every((fragment) => /\(\s*$/.test(fragment.trim())) ||
    !options['Г']
  ) {
    return null
  }

  if (POSITION_MARKER_RE.test(prompt)) {
    const parsedFragments = markedFragments.map((fragment, index) =>
      parsePositionFragment(fragment, CHOICE_LABELS[index]),
    )
    const choices = Object.fromEntries(
      CHOICE_LABELS.map((label) => [label, `позиция ${label}`]),
    )
    const sentenceHtml = normalizeSentenceSpacing(
      [
        ...parsedFragments.map((fragment) => fragment.html),
        escapeHtml(options['Г']),
      ].join(' '),
    )
    const sentenceText = normalizeSentenceSpacing(
      [
        ...parsedFragments.map((fragment) => fragment.text),
        options['Г'],
      ].join(' '),
    )

    return {
      prompt,
      sentenceHtml,
      sentenceText,
      choices,
    }
  }

  const parsedFragments = markedFragments.map(parseMarkedFragment)
  if (parsedFragments.some((fragment) => !fragment)) return null

  const choices = Object.fromEntries(
    parsedFragments.map((fragment, index) => [
      CHOICE_LABELS[index],
      fragment!.choice,
    ]),
  )

  const sentenceHtml = normalizeSentenceSpacing(
    [
      ...parsedFragments.map((fragment) => fragment!.html),
      escapeHtml(options['Г']),
    ].join(' '),
  )
  const sentenceText = normalizeSentenceSpacing(
    [
      ...parsedFragments.map((fragment) => fragment!.text),
      options['Г'],
    ].join(' '),
  )

  return {
    prompt,
    sentenceHtml,
    sentenceText,
    choices,
  }
}
