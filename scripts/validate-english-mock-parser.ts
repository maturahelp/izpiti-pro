import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { officialEnglishMockExams } from '../lib/official-english-mock-data'
import { buildEnglishMockGroups, englishMockParserInternals } from '../lib/english-mock'

type ReviewIssue = {
  examId: string
  year: number
  groupKey: string
  severity: 'error'
  rule: string
  message: string
  evidenceSnippet: string
}

type ValidationResult = {
  generatedAt: string
  summary: {
    examsChecked: number
    groupsChecked: number
    issuesFound: number
  }
  issues: ReviewIssue[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'english-mock-review')
const JSON_REPORT = path.join(OUTPUT_DIR, 'validation-report.json')
const MARKDOWN_REPORT = path.join(OUTPUT_DIR, 'validation-summary.md')

const LISTENING_PATTERNS = [
  /\bLISTENING COMPREHENSION\b/i,
  /\bTRANSCRIPTS\b/i,
  /\bYou will hear a text twice\b/i,
  /\bBefore you listen\b/i,
  /\bЛист за учителя\b/i,
  /\bПолзва се само от учителя-консултант\b/i,
]

const QUESTION_AREA_PATTERNS = [
  /(?:^|\n)\s*\d{1,2}\.\s+/m,
  /(?:^|\n)\s*[A-Da-d]\)\s+/m,
]

const HEADER_LEAK_PATTERNS = [
  /(?:^|\n)\s*МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО/m,
  /(?:^|\n)\s*ДЪРЖАВЕН ЗРЕЛОСТЕН ИЗПИТ/m,
  /(?:^|\n)\s*READING COMPREHENSION\s*$/im,
  /(?:^|\n)\s*PART\s+[A-ZА-Я]+/m,
]

function snippet(text: string, max = 220): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max)
}

function countReadingMarkers(contextText: string): number {
  const beforeWriting = contextText
    .split(/LISTENING TRANSCRIPTS|TRANSCRIPTS/i)[0]
    .split(/(?:^|\n)\s*(?:PART FOUR:\s*WRITING|WRITING)\b/im)[0]

  return [
    ...beforeWriting.matchAll(
      /(?:^|\n)\s*(?:Task\s+(?:One|Two|Three|Four|Five|Six|Seven)|Directions:\s*Read the texts?\s+below\.)/gim
    ),
  ].length
}

function runParserUnitChecks(): void {
  const {
    normalizeSource,
    normalizeWrappedText,
    trimBeforeFirstQuestionArea,
    trimWritingTeacherAppendix,
  } = englishMockParserInternals

  assert.equal(trimBeforeFirstQuestionArea('Intro paragraph\nA) True\nB) False'), 'Intro paragraph')
  assert.equal(trimBeforeFirstQuestionArea('Intro paragraph\n44. Write an essay'), 'Intro paragraph')
  assert.equal(
    trimWritingTeacherAppendix(
      'WRITING\nIntro text\nМИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО\nLISTENING COMPREHENSION'
    ),
    'WRITING\nIntro text'
  )
  assert.equal(normalizeSource('slow-\nmoving water'), 'slowmoving water')
  assert.equal(
    normalizeWrappedText('Liberty Hill was a small freshwater town\nnot a hill, really, but a rise in the land.'),
    'Liberty Hill was a small freshwater town not a hill, really, but a rise in the land.'
  )
}

function buildValidationResult(): ValidationResult {
  runParserUnitChecks()

  const issues: ReviewIssue[] = []
  const seenIds = new Set<string>()
  let groupsChecked = 0

  for (const exam of officialEnglishMockExams) {
    if (seenIds.has(exam.id)) {
      issues.push({
        examId: exam.id,
        year: exam.year,
        groupKey: '__exam__',
        severity: 'error',
        rule: 'route-data-integrity',
        message: 'Duplicate exam id detected.',
        evidenceSnippet: exam.id,
      })
    }
    seenIds.add(exam.id)

    const groups = buildEnglishMockGroups(exam)
    groupsChecked += groups.length

    if (groups.length === 0) {
      issues.push({
        examId: exam.id,
        year: exam.year,
        groupKey: '__exam__',
        severity: 'error',
        rule: 'empty-or-missing-groups',
        message: 'Exam produced no reading/writing groups.',
        evidenceSnippet: snippet(exam.source_title || exam.id),
      })
      continue
    }

    const ownersByQuestion = new Map<number, string[]>()
    for (const group of groups) {
      for (const question of group.questions) {
        const owners = ownersByQuestion.get(question.number) || []
        owners.push(group.key)
        ownersByQuestion.set(question.number, owners)
      }
    }

    for (const question of exam.questions) {
      const owners = ownersByQuestion.get(question.number) || []
      if (owners.length !== 1) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: owners[0] || '__exam__',
          severity: 'error',
          rule: 'dropped-or-duplicated-questions',
          message: `Question ${question.original_number} must belong to exactly one group; found ${owners.length}.`,
          evidenceSnippet: snippet(question.question),
        })
      }
    }

    const readingGroups = groups.filter((group) =>
      group.questions.some((question) => question.section === 'reading' || question.section === 'open_reading')
    )
    const writingGroups = groups.filter((group) =>
      group.questions.some((question) => question.section === 'writing')
    )

    if (exam.year < 2022) {
      const expectedMarkers = countReadingMarkers(exam.context_text || '')
      if (expectedMarkers > 0 && readingGroups.length < expectedMarkers) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: '__exam__',
          severity: 'error',
          rule: 'older-exam-structure',
          message: `Older exam appears to have missing reading passages: expected at least ${expectedMarkers}, got ${readingGroups.length}.`,
          evidenceSnippet: snippet(exam.source_title || exam.id),
        })
      }
    }

    for (const group of groups) {
      const isWritingGroup = group.questions.some((question) => question.section === 'writing')
      const bodyText = [group.instruction || '', ...group.paragraphs].filter(Boolean).join('\n\n')

      if (!bodyText.trim()) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: 'empty-or-missing-groups',
          message: 'Group has no visible instruction or passage text.',
          evidenceSnippet: group.title,
        })
      }

      if (LISTENING_PATTERNS.some((pattern) => pattern.test(bodyText))) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: isWritingGroup ? 'mixed-writing-appendix' : 'listening-leakage',
          message: isWritingGroup
            ? 'Writing group still contains teacher/listening appendix text.'
            : 'Group text contains listening or transcript content.',
          evidenceSnippet: snippet(bodyText),
        })
      }

      if (!isWritingGroup && QUESTION_AREA_PATTERNS.some((pattern) => pattern.test(bodyText))) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: 'mixed-passage-question-text',
          message: 'Reading passage still contains question numbering or answer options.',
          evidenceSnippet: snippet(bodyText),
        })
      }

      if (isWritingGroup && QUESTION_AREA_PATTERNS.some((pattern) => pattern.test(bodyText))) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: 'writing-structure',
          message: 'Writing intro still contains task prompt numbering or answer-option structure.',
          evidenceSnippet: snippet(bodyText),
        })
      }

      if (!isWritingGroup && /(?:^|\n)\s*[A-Da-d]\)\s+/m.test(bodyText)) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: 'answer-option-leakage',
          message: 'Reading body still contains answer-option lines.',
          evidenceSnippet: snippet(bodyText),
        })
      }

      if (HEADER_LEAK_PATTERNS.some((pattern) => pattern.test(bodyText))) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: 'formatting-regression',
          message: 'Body text still contains structural headers instead of clean prose/instructions.',
          evidenceSnippet: snippet(bodyText),
        })
      }

      const suspiciousParagraph = group.paragraphs.find((paragraph) => {
        const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean)
        return lines.length >= 4 && lines.every((line) => line.length <= 55)
      })

      if (suspiciousParagraph) {
        issues.push({
          examId: exam.id,
          year: exam.year,
          groupKey: group.key,
          severity: 'error',
          rule: 'formatting-regression',
          message: 'Paragraph still looks like OCR-broken line wrapping.',
          evidenceSnippet: snippet(suspiciousParagraph),
        })
      }
    }

    if (writingGroups.length === 0) {
      issues.push({
        examId: exam.id,
        year: exam.year,
        groupKey: '__exam__',
        severity: 'error',
        rule: 'empty-or-missing-groups',
        message: 'Exam has no writing group after parsing.',
        evidenceSnippet: snippet(exam.source_title || exam.id),
      })
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      examsChecked: officialEnglishMockExams.length,
      groupsChecked,
      issuesFound: issues.length,
    },
    issues,
  }
}

async function writeReports(result: ValidationResult): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.writeFile(JSON_REPORT, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

  const lines = [
    '# English Mock Parser Validation',
    '',
    `- Generated at: ${result.generatedAt}`,
    `- Exams checked: ${result.summary.examsChecked}`,
    `- Groups checked: ${result.summary.groupsChecked}`,
    `- Issues found: ${result.summary.issuesFound}`,
    '',
  ]

  if (result.issues.length === 0) {
    lines.push('No anomalies detected.')
  } else {
    for (const issue of result.issues) {
      lines.push(`## ${issue.rule} :: ${issue.examId} :: ${issue.groupKey}`)
      lines.push(`- Severity: ${issue.severity}`)
      lines.push(`- Message: ${issue.message}`)
      lines.push(`- Evidence: ${issue.evidenceSnippet}`)
      lines.push('')
    }
  }

  await fs.writeFile(MARKDOWN_REPORT, `${lines.join('\n')}\n`, 'utf8')
}

async function main(): Promise<void> {
  const result = buildValidationResult()
  await writeReports(result)

  console.log(`Validation report: ${path.relative(ROOT, JSON_REPORT)}`)
  console.log(`Validation summary: ${path.relative(ROOT, MARKDOWN_REPORT)}`)
  console.log(`Exams checked: ${result.summary.examsChecked}`)
  console.log(`Groups checked: ${result.summary.groupsChecked}`)
  console.log(`Issues found: ${result.summary.issuesFound}`)

  if (result.issues.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
