import type { OfficialEnglishExam, OfficialEnglishQuestion } from '@/lib/official-english-mock-data'

export interface EnglishMockBlock {
  startQuestion: number
  title: string
  body: string
  section: string
  questions: OfficialEnglishQuestion[]
}

export interface EnglishMockGroup {
  key: string
  title: string
  instruction?: string
  paragraphs: string[]
  questions: OfficialEnglishQuestion[]
}

const TRANSCRIPT_SPLIT_RE = /\bLISTENING TRANSCRIPTS\b|\bTRANSCRIPTS\b/i
const READING_START_RE = /(?:^|\n)\s*(?:PART\s+(?:TWO|THREE):\s*)?READING COMPREHENSION\s*$/im
const PART_HEADING_RE = /(?:^|\n)\s*PART\s+[A-ZА-Я]+:\s*[^\n]*/gim
const WRITING_HEADING_RE = /(?:^|\n)\s*(?:PART\s+(?:THREE|FOUR|FIVE):\s*WRITING|WRITING)\s*$/im
const TASK_MARKER_RE =
  /(?:^|\n)\s*(Task\s+(?:One|Two|Three|Four|Five|Six|Seven)|Directions:\s*Read the texts?\s+below\.)/gi
const QUESTION_START_RE = /(?:^|\n)\s*\d{1,2}\.\s+/
const OPTION_START_RE = /(?:^|\n)\s*[A-D]\)\s+/
const TEACHER_SHEET_RE = /(?:^|\n)\s*МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО|\bЛист за учителя\b|\bПолзва се само от учителя-консултант\b/im

function normalizeSource(text: string): string {
  return text
    .replace(/(\w)-\n([a-z])/g, '$1$2')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getQuestionStartNumber(text: string): number | null {
  const match = text.match(/(?:^|\n)\s*(\d{1,2})\.\s+/)
  return match ? Number(match[1]) : null
}

function lines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function normalizeWrappedText(text: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return paragraphs
    .map((paragraph) => {
      const paragraphLines = paragraph
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      const keepLines = paragraphLines.some((line) => {
        return (
          /^•/.test(line) ||
          /^[A-D]\)/.test(line) ||
          /^Task\s+/i.test(line) ||
          /^Directions:/i.test(line) ||
          /^\d{1,2}\.\s+/.test(line)
        )
      })

      if (keepLines) {
        return paragraphLines.join('\n')
      }

      return paragraphLines
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .trim()
    })
    .join('\n\n')
}

function splitInstructionAndBody(text: string): { instruction?: string; paragraphs: string[] } {
  const cleaned = text.trim()
  if (!cleaned) return { instruction: undefined, paragraphs: [] }

  const blockLines = cleaned.split('\n')
  const proseStart = blockLines.findIndex((line) => {
    const trimmed = line.trim()
    return (
      Boolean(trimmed) &&
      !/^Task\s+/i.test(trimmed) &&
      !/^Section\s+/i.test(trimmed) &&
      !/^Directions:/i.test(trimmed) &&
      !/^PART\s+/i.test(trimmed) &&
      !/^READING COMPREHENSION$/i.test(trimmed)
    )
  })

  if (proseStart === -1) return { instruction: cleaned, paragraphs: [] }

  const before = normalizeWrappedText(blockLines.slice(0, proseStart).join('\n').trim())
  const after = normalizeWrappedText(blockLines.slice(proseStart).join('\n').trim())
  const paragraphs = after.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return {
    instruction: before || undefined,
    paragraphs,
  }
}

function sliceBeforeTranscripts(raw: string): string {
  return raw.split(TRANSCRIPT_SPLIT_RE)[0]?.trim() || ''
}

function stripLeadingHeading(text: string, title: string): string {
  return text.replace(new RegExp(`^\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), '').trim()
}

function trimBeforeFirstQuestionArea(text: string): string {
  const starts = [text.search(QUESTION_START_RE), text.search(OPTION_START_RE)].filter((index) => index >= 0)
  if (!starts.length) return text.trim()
  return text.slice(0, Math.min(...starts)).trim()
}

function trimWritingTeacherAppendix(text: string): string {
  const match = text.match(TEACHER_SHEET_RE)
  if (!match || match.index == null) return text.trim()
  return text.slice(0, match.index).trim()
}

function findNextPartBoundary(raw: string, startIndex: number, section: 'reading' | 'writing'): number {
  PART_HEADING_RE.lastIndex = 0

  for (const match of raw.matchAll(PART_HEADING_RE)) {
    if (match.index == null || match.index <= startIndex) continue

    const heading = match[0].trim()
    const isSameSection =
      section === 'reading' ? /READING COMPREHENSION/i.test(heading) : /\bWRITING\b/i.test(heading)

    if (!isSameSection) {
      return match.index
    }
  }

  return raw.length
}

function buildReadingBlocks(
  readingText: string,
  questions: OfficialEnglishQuestion[]
): EnglishMockBlock[] {
  const matches = [...readingText.matchAll(TASK_MARKER_RE)]

  if (!matches.length) {
    return [
      {
        startQuestion: questions[0].number,
        title: 'PART TWO: READING COMPREHENSION',
        body: readingText.trim(),
        section: 'reading',
        questions,
      },
    ]
  }

  return matches
    .map((match, index) => {
      const start = match.index ?? 0
      const end = index + 1 < matches.length ? matches[index + 1].index ?? readingText.length : readingText.length
      const chunk = readingText.slice(start, end).trim()
      const startQuestion = getQuestionStartNumber(chunk)
      if (!startQuestion) return null

      const blockQuestions = questions.filter((question) => question.original_number >= startQuestion).filter((question) => {
        const nextStart = index + 1 < matches.length ? getQuestionStartNumber(readingText.slice(matches[index + 1].index ?? 0)) : null
        return nextStart ? question.original_number < nextStart : true
      })
      if (!blockQuestions.length) return null

      const chunkLines = lines(chunk)
      const markerLine = chunkLines.find((line) => /^Task\s+/i.test(line) || /^Directions:/i.test(line))
      const title = markerLine && /^Task\s+/i.test(markerLine) ? markerLine : `Passage ${index + 1}`
      return {
        startQuestion: blockQuestions[0].number,
        title,
        body: trimBeforeFirstQuestionArea(
          markerLine && /^Directions:/i.test(markerLine)
            ? stripLeadingHeading(chunk, markerLine)
            : stripLeadingHeading(chunk, title)
        ),
        section: 'reading',
        questions: blockQuestions,
      }
    })
    .filter((block): block is EnglishMockBlock => Boolean(block))
}

export function extractEnglishMockBlocks(exam: OfficialEnglishExam): EnglishMockBlock[] {
  const raw = sliceBeforeTranscripts(normalizeSource(exam.context_text || ''))
  if (!raw) return []

  const readingStart = raw.search(READING_START_RE)
  const writingStart = raw.search(WRITING_HEADING_RE)
  if (readingStart < 0 && writingStart < 0) return []

  const readingQuestions = exam.questions.filter((question) => question.section === 'reading' || question.section === 'open_reading')
  const writingQuestions = exam.questions.filter((question) => question.section === 'writing')
  const readingEnd = (() => {
    if (writingStart >= 0) return writingStart
    return findNextPartBoundary(raw, readingStart, 'reading')
  })()

  const blocks: EnglishMockBlock[] = []

  if (readingStart >= 0 && readingQuestions.length > 0) {
    const readingText = raw.slice(readingStart, readingEnd).trim()
    blocks.push(...buildReadingBlocks(readingText, readingQuestions))
  }

  if (writingStart >= 0 && writingQuestions.length > 0) {
    const writingText = trimWritingTeacherAppendix(raw.slice(writingStart).trim())
    const title = lines(writingText)[0] || 'WRITING'
    const bodyWithoutTitle = stripLeadingHeading(writingText, title)
    const bodyWithoutQuestionText = trimBeforeFirstQuestionArea(bodyWithoutTitle)
    blocks.push({
      startQuestion: writingQuestions[0].number,
      title,
      body: bodyWithoutQuestionText,
      section: 'writing',
      questions: writingQuestions,
    })
  }

  return blocks.sort((a, b) => a.startQuestion - b.startQuestion)
}

export function buildEnglishMockGroups(exam: OfficialEnglishExam): EnglishMockGroup[] {
  const blocks = extractEnglishMockBlocks(exam)
  return blocks.map((block) => {
    const { instruction, paragraphs } = splitInstructionAndBody(block.body)

    return {
      key: `${exam.id}-${block.startQuestion}`,
      title: block.title,
      instruction,
      paragraphs,
      questions: block.questions,
    }
  })
}

export const englishMockParserInternals = {
  normalizeSource,
  normalizeWrappedText,
  trimBeforeFirstQuestionArea,
  trimWritingTeacherAppendix,
}
