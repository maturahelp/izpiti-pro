import fs from 'node:fs'
import path from 'node:path'
import officialDataset from '../data/official_quiz_dataset.json'
import mockMathPracticeDataset from '../data/mock_math_exam_practice.json'
import { MOCK_NVO_MATH_FIGURES } from '../data/nvo-math-figure-assets'

type OptionMap = Record<string, string>

interface OfficialQuestion {
  number: number
  type: 'single_choice' | 'open_response'
  question: string
  options?: OptionMap
  correct_option?: string
  question_image?: string
  task_condition?: string
}

interface OfficialExam {
  id: string
  subject: string
  questions: OfficialQuestion[]
}

interface MockQuestion {
  number: number
  question: string
  options?: OptionMap
  answer_guide?: string
  source_tags?: {
    source_id?: string
  }
}

interface MockExam {
  id: string
  questions: MockQuestion[]
}

const SHARED_Q19_Q20_CONDITION =
  'За задачи 19. и 20. в листа за отговори запишете буквата на въпроса и Вашия отговор срещу нея.'

const DRAWING_NOTE_CONDITION =
  'Чертежите са само за илюстрация. Те не са начертани в мащаб и не са предназначени за директно измерване на дължини и на ъгли.'

const BOILERPLATE_RE = /За задачи 19\. и 20\.|ПО МАТЕМАТИКА\s*[–-]\s*VII|ВТОРА ЧАСТ|Пълните решения|ОБРАЗОВАНИЕ\s+МАТЕМАТИКА/i
const VISUAL_PROMPT_RE = /чертеж|диаграм|координатна система|квадратна мрежа|изобразена на чертежа/i

const EXPECTED_OPEN_RESPONSE: Record<string, Partial<Record<18 | 19 | 20, string[]>>> = {
  '2019_math': { 18: ['А', 'Б'], 19: ['А', 'Б', 'В'], 20: ['А', 'Б'] },
  '2020_math': { 19: ['А', 'Б', 'В', 'Г'], 20: ['А', 'Б', 'В', 'Г', 'Д'] },
  '2021_math': { 19: ['А', 'Б', 'В', 'Г'], 20: ['А', 'Б', 'В', 'Г', 'Д'] },
  '2022_math': { 19: ['А', 'Б', 'В'], 20: ['А', 'Б', 'В', 'Г'] },
  '2023_math': { 19: ['А', 'Б'], 20: ['А', 'Б', 'В'] },
}

const EXPECTED_TASK_CONDITION_EXAMS = new Set(['2020_math', '2021_math', '2022_math', '2023_math'])

const EXPECTED_DRAWING_NOTE_TARGETS: Record<string, number> = {
  '2019_math': 9,
  '2021_math': 10,
  '2022_math': 12,
  '2023_math': 11,
  '2024_math': 10,
  '2025_math': 9,
}

const EXPECTED_FIGURE_SOURCE_IDS = [
  '2018_math_q13',
  '2019_math_q17',
  '2020_math_q10',
  '2020_math_q11',
  '2020_math_q12',
  '2020_math_q13',
  '2020_math_q15',
  '2020_math_q16',
  '2021_math_q11',
  '2021_math_q12',
  '2021_math_q17',
  '2022_math_q13',
  '2022_math_q14',
  '2022_math_q15',
  '2023_math_q12',
  '2023_math_q13',
  '2023_math_q16',
  '2024_math_q19',
  '2025_math_q09',
  '2025_math_q10',
]

function fail(message: string): never {
  throw new Error(message)
}

function getQuestion(exam: OfficialExam, number: number): OfficialQuestion {
  const question = exam.questions.find((item) => item.number === number)
  if (!question) fail(`${exam.id} is missing question ${number}`)
  return question
}

function assertNoBoilerplate(value: string | undefined, context: string) {
  if (value && BOILERPLATE_RE.test(value)) {
    fail(`${context} still contains extracted boilerplate: ${value}`)
  }
}

function assertOptions(question: OfficialQuestion, expectedLabels: string[], context: string) {
  if (!question.options) fail(`${context} is missing subpart options`)
  const labels = Object.keys(question.options)
  const actual = labels.join(',')
  const expected = expectedLabels.join(',')
  if (actual !== expected) {
    fail(`${context} labels mismatch. Expected ${expected}; got ${actual}`)
  }
  for (const [label, text] of Object.entries(question.options)) {
    assertNoBoilerplate(text, `${context} option ${label}`)
  }
}

function validateOfficialMathNvo() {
  const exams = (officialDataset as OfficialExam[]).filter((exam) => exam.subject === 'Математика')
  if (!exams.length) fail('No official math NVO exams found')

  for (const exam of exams) {
    for (const question of exam.questions) {
      if (!question.options) continue
      for (const [label, text] of Object.entries(question.options)) {
        if (/Чертежите са само|директно измерване/i.test(text)) {
          fail(`${exam.id} q${question.number} option ${label} still includes the drawing note`)
        }
      }
    }

    const drawingNoteTarget = EXPECTED_DRAWING_NOTE_TARGETS[exam.id]
    if (drawingNoteTarget) {
      const question = getQuestion(exam, drawingNoteTarget)
      if (question.task_condition !== DRAWING_NOTE_CONDITION) {
        fail(`${exam.id} q${drawingNoteTarget} should carry the extracted drawing-note task_condition`)
      }
    }

    const q18 = getQuestion(exam, 18)
    if (q18.options) {
      for (const [label, text] of Object.entries(q18.options)) {
        if (text.includes(SHARED_Q19_Q20_CONDITION) || /За задачи 19\. и 20\./i.test(text)) {
          fail(`${exam.id} q18 option ${label} still includes the q19/q20 condition`)
        }
      }
    }

    if (exam.id === '2022_math') {
      const q7 = getQuestion(exam, 7)
      assertOptions(q7, ['А', 'Б', 'В', 'Г'], '2022_math q7')
      const expectedOptions: OptionMap = { А: '2018', Б: '2019', В: '2020', Г: '2021' }
      for (const [label, expectedText] of Object.entries(expectedOptions)) {
        if (q7.options?.[label] !== expectedText) {
          fail(`2022_math q7 option ${label} should be ${expectedText}; got ${q7.options?.[label] || 'missing'}`)
        }
      }
    }

    const expected = EXPECTED_OPEN_RESPONSE[exam.id] || {}
    for (const number of [18, 19, 20] as const) {
      const expectedLabels = expected[number]
      const question = getQuestion(exam, number)
      assertNoBoilerplate(question.question, `${exam.id} q${number} question`)

      if (number === 20 && question.options) {
        for (const [label, text] of Object.entries(question.options)) {
          assertNoBoilerplate(text, `${exam.id} q20 option ${label}`)
        }
      }

      if (!expectedLabels) continue
      if (question.type !== 'open_response') fail(`${exam.id} q${number} should be open_response`)
      if (question.correct_option) fail(`${exam.id} q${number} should not keep fake correct_option`)
      if (!question.question_image) fail(`${exam.id} q${number} should retain question_image`)
      assertOptions(question, expectedLabels, `${exam.id} q${number}`)

      if (
        number === 19 &&
        EXPECTED_TASK_CONDITION_EXAMS.has(exam.id) &&
        question.task_condition !== SHARED_Q19_Q20_CONDITION
      ) {
        fail(`${exam.id} q19 should carry the extracted q19/q20 task_condition`)
      }
    }
  }
}

function validateTestPageFigureRendering() {
  const pagePath = path.join(process.cwd(), 'app', '(student)', 'dashboard', 'tests', '[id]', 'page.tsx')
  const pageSource = fs.readFileSync(pagePath, 'utf8')
  if (pageSource.includes('Отвори фигурата')) {
    fail('SVG figures should render inline without an "Отвори фигурата" new-window link')
  }
}

function validateMockMathFigures() {
  const mappedIds = Object.keys(MOCK_NVO_MATH_FIGURES).sort()
  const expected = [...EXPECTED_FIGURE_SOURCE_IDS].sort()
  if (mappedIds.join(',') !== expected.join(',')) {
    fail(`Mock figure source ids mismatch.\nExpected: ${expected.join(', ')}\nActual: ${mappedIds.join(', ')}`)
  }

  for (const sourceId of expected) {
    const href = MOCK_NVO_MATH_FIGURES[sourceId as keyof typeof MOCK_NVO_MATH_FIGURES]
    if (!href.startsWith('/figures/mock-nvo-math/')) {
      fail(`${sourceId} figure path should live under /figures/mock-nvo-math/: ${href}`)
    }
    const filePath = path.join(process.cwd(), 'public', href)
    if (!fs.existsSync(filePath)) fail(`${sourceId} figure file is missing: ${filePath}`)
    const svg = fs.readFileSync(filePath, 'utf8')
    if (!svg.includes('<svg') || !svg.includes('</svg>')) fail(`${sourceId} is not a complete SVG file`)
  }

  const svgText = (sourceId: string) => {
    const href = MOCK_NVO_MATH_FIGURES[sourceId as keyof typeof MOCK_NVO_MATH_FIGURES]
    return fs.readFileSync(path.join(process.cwd(), 'public', href), 'utf8')
  }

  if (!svgText('2020_math_q15').includes('>Q<')) fail('2020_math_q15 should label the point on AB as Q')
  if (svgText('2020_math_q10').includes('∠1')) fail('2020_math_q10 should use the official numeric angle labels, not invented angle notation')
  if (!svgText('2020_math_q10').includes('>a<') || !svgText('2020_math_q10').includes('>b<')) {
    fail('2020_math_q10 should label the two intersecting lines as a and b')
  }
  if (!svgText('2023_math_q16').includes('>O<')) fail('2023_math_q16 should label the intersection of BC and MT as O')
  if (!svgText('2022_math_q13').includes('x + 20°')) fail('2022_math_q13 should use the official x + 20° label')
  if (!svgText('2023_math_q12').includes('>x<')) fail('2023_math_q12 should mark the requested angle x')
  if (!svgText('2025_math_q09').includes('>α<')) fail('2025_math_q09 should mark the requested angle α')
  if (svgText('2025_math_q10').includes('>C<')) fail('2025_math_q10 should not pre-draw the constructed symmetric point C')

  const mockExams = (mockMathPracticeDataset as { exams: MockExam[] }).exams
  const missing: string[] = []
  for (const exam of mockExams) {
    for (const question of exam.questions) {
      if (question.source_tags?.source_id === '2021_math_q17' && /ромб/i.test(question.question)) {
        fail(`${exam.id} q${question.number} should describe source 2021_math_q17 as a trapezoid, not a rhombus`)
      }
      if (question.source_tags?.source_id === '2024_math_q19' && question.options) {
        for (const [label, text] of Object.entries(question.options)) {
          if (/Видове изпълнения/i.test(text)) {
            fail(`${exam.id} q${question.number} option ${label} still contains chart label boilerplate`)
          }
        }
        if (/Видове изпълнения/i.test(question.answer_guide || '')) {
          fail(`${exam.id} q${question.number} answer guide still contains chart label boilerplate`)
        }
      }
      if (!VISUAL_PROMPT_RE.test(question.question || '')) continue
      const sourceId = question.source_tags?.source_id
      if (!sourceId || !MOCK_NVO_MATH_FIGURES[sourceId]) {
        missing.push(`${exam.id} q${question.number} (${sourceId || 'no source_id'})`)
      }
    }
  }
  if (missing.length) {
    fail(`Visual mock math questions without SVG mapping:\n${missing.join('\n')}`)
  }
}

validateOfficialMathNvo()
validateMockMathFigures()
validateTestPageFigureRendering()
console.log('NVO math content validation passed.')
