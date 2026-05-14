import officialNvo4Dataset from '../data/official_nvo4_dataset.json'
import mockNvo4PracticeDataset from '../data/mock_nvo4_exam_practice.json'
import extractionReport from '../data/nvo4_extraction_report.json'
import { nvo4Tests } from '../data/nvo4-tests'

type Question = {
  number: number
  type: string
  question: string
  options?: Record<string, string>
  correct_option?: string
  official_answer?: string
}

type Exam = {
  id: string
  year: number
  subject: string
  source_url?: string
  exam_type: string
  questions: Question[]
}

function fail(message: string): never {
  throw new Error(message)
}

const official = officialNvo4Dataset as Exam[]
const mock = (mockNvo4PracticeDataset as { exams: Exam[] }).exams
const allExams = [...official, ...mock]

const expectedOfficialYears = [
  2025, 2024, 2023, 2022, 2021, 2019, 2018, 2017, 2016,
  2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007,
]

if (official.length !== expectedOfficialYears.length * 2) {
  fail(`Expected ${expectedOfficialYears.length * 2} official exams, got ${official.length}`)
}

if (mock.length !== 6) {
  fail(`Expected 6 model/sample exams, got ${mock.length}`)
}

for (const year of expectedOfficialYears) {
  for (const subject of ['bel', 'math'] as const) {
    const id = `nvo4_${year}_${subject}`
    if (!official.some((exam) => exam.id === id)) fail(`Missing official exam ${id}`)
  }
}

if (official.some((exam) => exam.year === 2020)) {
  fail('The MON source page has no 2020 official test; dataset must not invent one')
}

for (const exam of allExams) {
  if (exam.exam_type !== 'nvo4_bel' && exam.exam_type !== 'nvo4_math') {
    fail(`${exam.id} has invalid exam_type ${exam.exam_type}`)
  }
  if (!exam.questions.length) fail(`${exam.id} has no questions`)
  if (/човекът и природата|човекът и обществото/i.test(`${exam.subject} ${exam.id} ${exam.source_url ?? ''}`)) {
    fail(`${exam.id} contains an off-scope subject`)
  }
  for (const question of exam.questions) {
    if (!Number.isInteger(question.number) || question.number < 1) {
      fail(`${exam.id} has invalid question number ${question.number}`)
    }
    if (!question.question.trim()) fail(`${exam.id} q${question.number} has empty question text`)
    if (question.type === 'single_choice') {
      if (!question.options || Object.keys(question.options).length < 2) {
        fail(`${exam.id} q${question.number} is single_choice without enough options`)
      }
      if (!question.correct_option && !String(question.official_answer ?? '').startsWith('TODO:')) {
        fail(`${exam.id} q${question.number} has an answer guide but no correct_option`)
      }
    }
  }
}

const sourceSubjects = new Set((extractionReport.sources as Array<{ subject: string }>).map((source) => source.subject))
if ([...sourceSubjects].some((subject) => subject !== 'bel' && subject !== 'math')) {
  fail(`Extraction report includes off-scope subjects: ${[...sourceSubjects].join(', ')}`)
}

const catalogIds = new Set(nvo4Tests.map((test) => test.id))
for (const year of expectedOfficialYears) {
  if (!catalogIds.has(`nvo4-bel-${year}`)) fail(`Catalog missing nvo4-bel-${year}`)
  if (!catalogIds.has(`nvo4-math-${year}`)) fail(`Catalog missing nvo4-math-${year}`)
}

console.log(`Validated ${official.length} official NVO 4 exams, ${mock.length} model/sample exams, ${nvo4Tests.length} catalog entries.`)
