import mockPracticeData from './mock_exam_practice.json'
import mockMathPracticeData from './mock_math_exam_practice.json'
import type { Test } from './tests'

interface MockPracticeQuestion {
  number: number
  type: 'single_choice' | 'open_response'
}

interface MockPracticeExam {
  id: string
  title: string
  exam_type: 'nvo_bel' | 'dzi_bel' | 'nvo_math' | 'dzi_math'
  questions: MockPracticeQuestion[]
}

interface MockPracticePayload {
  exams: MockPracticeExam[]
}

const payload = mockPracticeData as MockPracticePayload
const mathPayload = mockMathPracticeData as MockPracticePayload

export const mockTests: Test[] = [...payload.exams, ...mathPayload.exams].map((exam) => {
  const isNvo = exam.exam_type === 'nvo_bel' || exam.exam_type === 'nvo_math'
  const isMath = exam.exam_type === 'nvo_math' || exam.exam_type === 'dzi_math'

  return {
    id: exam.id,
    title: exam.title,
    subjectId: isMath ? (isNvo ? 'math-7' : 'math-12') : isNvo ? 'bg-lang-7' : 'bg-lang-12',
    subjectName: isMath ? 'Математика' : isNvo ? 'Български език' : 'Български език и литература',
    topicId: isMath ? (isNvo ? 'math7-nvo-mock' : 'math12-dzi-mock') : isNvo ? 'bg7-nvo-mock' : 'bg12-dzi-mock',
    topicName: isMath ? (isNvo ? 'НВО — Примерен изпит' : 'ДЗИ — Примерен изпит') : isNvo ? 'НВО — Примерен изпит' : 'ДЗИ — Примерен изпит',
    examType: isNvo ? 'nvo7' : 'dzi12',
    difficulty: isMath ? (isNvo ? 'среден' : 'труден') : isNvo ? 'среден' : 'труден',
    questionsCount: exam.questions.length,
    timeMinutes: isMath ? (isNvo ? 60 : 240) : isNvo ? 75 : 240,
    isPremium: false,
    completedCount: 0,
    avgScore: 0,
    status: 'not_started',
    completedAt: undefined,
    lastScore: undefined,
  }
})
