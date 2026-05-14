import officialNvo4Dataset from '../data/official_nvo4_dataset.json'
import mockNvo4PracticeDataset from '../data/mock_nvo4_exam_practice.json'
import extractionReport from '../data/nvo4_extraction_report.json'
import { nvo4BulgarianMaterials, nvo4MathMaterials } from '../data/nvo4-generated-materials'
import { nvo4Tests } from '../data/nvo4-tests'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type Question = {
  number: number
  type: string
  question: string
  options?: Record<string, string>
  correct_option?: string
  official_answer?: string
  question_image?: string
  formatting_flags?: string[]
  source_tags?: {
    source_id?: string
    topic_bucket?: string
    source_url?: string
  }
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

if (mock.length !== 26) {
  fail(`Expected 26 model/sample/generated mock exams, got ${mock.length}`)
}

const sourceModelOrSample = mock.filter((exam) => /^mock_nvo4_(?:bel|math)_\d{4}_(?:model|sample)$/.test(exam.id))
if (sourceModelOrSample.length !== 6) {
  fail(`Expected 6 source model/sample exams, got ${sourceModelOrSample.length}`)
}

const generatedMathMocks = mock.filter((exam) => /^generated_nvo4_math_mock_\d{2}$/.test(exam.id))
const generatedBelMocks = mock.filter((exam) => /^generated_nvo4_bel_mock_\d{2}$/.test(exam.id))
if (generatedMathMocks.length !== 10) fail(`Expected 10 generated math mock exams, got ${generatedMathMocks.length}`)
if (generatedBelMocks.length !== 10) fail(`Expected 10 generated BEL mock exams, got ${generatedBelMocks.length}`)

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

const math2025 = official.find((exam) => exam.id === 'nvo4_2025_math') ?? fail('Missing nvo4_2025_math')
const math2025Q12 = math2025.questions.find((question) => question.number === 12) ?? fail('Missing nvo4_2025_math q12')
if (!math2025Q12.question.includes('\\(\\square\\)')) {
  fail('nvo4_2025_math q12 must render blank squares with MathJax square placeholders')
}
if (math2025Q12.question_image) {
  fail('nvo4_2025_math q12 should not use a PDF image for blank square placeholders')
}
if (JSON.stringify(math2025Q12.options) !== JSON.stringify({ А: '0', Б: '1', В: '10' })) {
  fail(`nvo4_2025_math q12 numeric options were not preserved: ${JSON.stringify(math2025Q12.options)}`)
}

const math2025Q13 = math2025.questions.find((question) => question.number === 13) ?? fail('Missing nvo4_2025_math q13')
if (!math2025Q13.question_image?.includes('_q13')) {
  fail(`nvo4_2025_math q13 should use a question-level crop, got ${math2025Q13.question_image ?? 'none'}`)
}
if (math2025Q13.question_image?.includes('_p2')) {
  fail('nvo4_2025_math q13 still points at a full-page snapshot')
}

for (const exam of official) {
  for (const question of exam.questions) {
    if (question.question_image?.match(/_p\d+\.(?:png|jpg|jpeg|webp)$/)) {
      fail(`${exam.id} q${question.number} still points at a full-page snapshot instead of a question crop`)
    }
  }
}

for (const exam of generatedMathMocks) {
  const imageQuestions = exam.questions.filter((question) => question.question_image)
  if (imageQuestions.length < 5) fail(`${exam.id} should include generated figures/graphs on at least 5 questions`)
  for (const question of imageQuestions) {
    const rel = question.question_image?.replace(/^\//, '')
    if (!rel || !existsSync(path.join(process.cwd(), 'public', rel.replace(/^public\//, '')))) {
      fail(`${exam.id} q${question.number} references missing generated image ${question.question_image}`)
    }
  }
}

type GeneratedMaterialTree = {
  units: Array<{
    title: string
    lessons: Array<{
      title: string
      items: Array<{ type: string; title: string; body: string; prompts?: string[] }>
    }>
  }>
}

function validateGeneratedMaterials(tree: GeneratedMaterialTree, subject: string, expectedUnits: number, minLessons: number, minItems: number) {
  const lessonCount = tree.units.reduce((total, unit) => total + unit.lessons.length, 0)
  const itemCount = tree.units.reduce(
    (total, unit) => total + unit.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.items.length, 0),
    0,
  )
  if (tree.units.length !== expectedUnits) fail(`Expected ${expectedUnits} ${subject} material units, got ${tree.units.length}`)
  if (lessonCount < minLessons) fail(`Expected at least ${minLessons} ${subject} lessons, got ${lessonCount}`)
  if (itemCount < minItems) fail(`Expected at least ${minItems} ${subject} material items, got ${itemCount}`)

  const materialText = JSON.stringify(tree)
  if (/khanacademy\.org|graded-group-set|Искаш ли да научиш повече|Искаш ли да се опиташ/i.test(materialText)) {
    fail(`${subject} materials include copied Khan/source-specific text instead of original generated content`)
  }
  if (/https?:\/\//i.test(materialText)) {
    fail(`${subject} materials should not expose external template URLs as lesson content`)
  }
}

validateGeneratedMaterials(nvo4MathMaterials as GeneratedMaterialTree, 'math', 7, 31, 144)
validateGeneratedMaterials(nvo4BulgarianMaterials as GeneratedMaterialTree, 'BEL', 6, 18, 72)

const khanTemplateShape = {
  units: 7,
  lessonsAtLeast: 31,
}
const mathLessonCount = nvo4MathMaterials.units.reduce((total, unit) => total + unit.lessons.length, 0)
if (nvo4MathMaterials.units.length !== khanTemplateShape.units || mathLessonCount < khanTemplateShape.lessonsAtLeast) {
  fail('Math materials must preserve the 4th-grade NVO template breadth while using original generated text')
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

const materialsPageSource = readFileSync(
  path.join(process.cwd(), 'app/(student)/dashboard/materials/page.tsx'),
  'utf8',
)
if (!materialsPageSource.includes('function fireGrade4MaterialConfetti()')) {
  fail('Grade 4 materials must include the same burst-style confetti used by 7th/12th grade materials')
}
if (!materialsPageSource.includes('completeGrade4Lesson(lesson.id)')) {
  fail('Grade 4 materials must trigger confetti from a student completion action')
}

const testDetailPageSource = readFileSync(
  path.join(process.cwd(), 'app/(student)/dashboard/tests/[id]/page.tsx'),
  'utf8',
)
if (!testDetailPageSource.includes("import Confetti from '@/components/ui/confetti'")) {
  fail('Grade 4 tests must keep the shared test-result confetti overlay')
}
if (!testDetailPageSource.includes('mockNvo4PracticeDataset')) {
  fail('Grade 4 tests must be rendered through the test detail page that owns test confetti')
}
if (!testDetailPageSource.includes('fireBurstConfetti()')) {
  fail('Grade 4 tests must keep the burst confetti trigger on strong submissions')
}

console.log(`Validated ${official.length} official NVO 4 exams, ${mock.length} model/sample/generated exams, ${nvo4Tests.length} catalog entries.`)
