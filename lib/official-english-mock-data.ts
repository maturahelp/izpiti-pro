import rawEnglishDataset from '@/data/official_dzi_english_dataset.json'

type RawEnglishQuestion = {
  number: number
  type: 'single_choice' | 'open_response'
  section?: string
  question: string
  options?: Record<string, string>
  correct_option?: string
  official_answer?: string
  answer_guide?: string
}

type RawEnglishExam = {
  id: string
  year: number
  subject: string
  published_at: string
  source_title?: string
  source_url?: string
  source_page_url?: string
  level?: string | null
  session?: string | null
  context_text?: string
  questions: RawEnglishQuestion[]
}

export interface OfficialEnglishQuestion extends RawEnglishQuestion {
  original_number: number
}

export interface OfficialEnglishExam extends Omit<RawEnglishExam, 'questions'> {
  questions: OfficialEnglishQuestion[]
}

const INCLUDED_SECTIONS = new Set(['reading', 'open_reading', 'writing'])
const normalizeExamSeenIds = new Map<string, number>()
const READING_START_RE = /(?:^|\n)\s*(?:PART\s+(?:TWO|THREE):\s*)?READING COMPREHENSION\s*$/im
const WRITING_START_RE = /(?:^|\n)\s*(?:PART\s+(?:THREE|FOUR|FIVE):\s*WRITING|WRITING)\s*$/im
const PART_HEADING_RE = /(?:^|\n)\s*PART\s+[A-ZА-Я]+:\s*[^\n]*/gim
const TRANSCRIPT_SPLIT_RE = /\bLISTENING TRANSCRIPTS\b|\bTRANSCRIPTS\b/i
const QUESTION_LINE_RE = /(?:^|\n)\s*(\d{1,2})\.\s+/g

function slugifyFragment(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function buildExamId(exam: RawEnglishExam, seenIds: Map<string, number>): string {
  const baseId = exam.id || `dzi-english-${exam.year}`
  const previousCount = seenIds.get(baseId) || 0
  seenIds.set(baseId, previousCount + 1)

  if (previousCount === 0) {
    return baseId
  }

  const datedText = [exam.source_title, exam.source_page_url, exam.source_url].filter(Boolean).join(' ')
  const dateMatch = datedText.match(/(\d{2})[.\-/](\d{2})[.\-/](\d{4})/)
  if (dateMatch) {
    const [, day, month, year] = dateMatch
    return `${baseId}-${year}-${month}-${day}`
  }

  const suffixSource = slugifyFragment(exam.source_title || exam.published_at || `${previousCount + 1}`)
  return `${baseId}-${suffixSource || previousCount + 1}`
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

function collectReadingQuestionNumbers(exam: RawEnglishExam): Set<number> {
  const source = exam.context_text || ''
  const raw = source.split(TRANSCRIPT_SPLIT_RE)[0]?.trim() || ''
  if (!raw) return new Set()

  const readingStart = raw.search(READING_START_RE)
  if (readingStart < 0) return new Set()
  const writingStart = raw.search(WRITING_START_RE)
  const readingEnd = (() => {
    if (writingStart >= 0) return writingStart
    return findNextPartBoundary(raw, readingStart, 'reading')
  })()

  const readingText = raw.slice(readingStart, readingEnd)
  const numbers = new Set<number>()
  for (const match of readingText.matchAll(QUESTION_LINE_RE)) {
    numbers.add(Number(match[1]))
  }
  return numbers
}

function normalizeExam(exam: RawEnglishExam, seenIds: Map<string, number>): OfficialEnglishExam {
  const readingQuestionNumbers = collectReadingQuestionNumbers(exam)

  return {
    ...exam,
    id: buildExamId(exam, seenIds),
    questions: exam.questions
      .filter(
        (question) =>
          question.section === 'writing' ||
          (readingQuestionNumbers.size > 0
            ? readingQuestionNumbers.has(question.number)
            : INCLUDED_SECTIONS.has(question.section || ''))
      )
      .map((question) => ({
        ...question,
        section:
          question.section === 'writing'
            ? 'writing'
            : readingQuestionNumbers.has(question.number)
              ? question.section === 'open_reading'
                ? 'open_reading'
                : 'reading'
              : question.section,
        original_number: question.number,
      })),
  }
}

export const officialEnglishMockExams: OfficialEnglishExam[] = (
  rawEnglishDataset as { exams: RawEnglishExam[] }
).exams
  .map((exam) => normalizeExam(exam, normalizeExamSeenIds))
  .filter((exam) => exam.questions.length > 0)
