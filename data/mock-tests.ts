import mockPracticeData from './mock_exam_practice.json'
import type { Test } from './tests'

interface MockPracticeQuestion {
  number: number
  type: 'single_choice' | 'open_response'
}

interface MockPracticeExam {
  id: string
  title: string
  exam_type: 'nvo_bel' | 'dzi_bel'
  questions: MockPracticeQuestion[]
}

interface MockPracticePayload {
  exams: MockPracticeExam[]
}

const payload = mockPracticeData as MockPracticePayload

export const mockTests: Test[] = payload.exams.map((exam) => {
  const isNvo = exam.exam_type === 'nvo_bel'

  return {
    id: exam.id,
    title: exam.title,
    subjectId: isNvo ? 'bg-lang-7' : 'bg-lang-12',
    subjectName: isNvo ? 'Български език' : 'Български език и литература',
    topicId: isNvo ? 'bg7-nvo-mock' : 'bg12-dzi-mock',
    topicName: isNvo ? 'НВО — Примерен изпит' : 'ДЗИ — Примерен изпит',
    examType: isNvo ? 'nvo7' : 'dzi12',
    difficulty: isNvo ? 'среден' : 'труден',
    questionsCount: exam.questions.length,
    timeMinutes: isNvo ? 75 : 240,
    isPremium: false,
    completedCount: 0,
    avgScore: 0,
    status: 'not_started',
    completedAt: undefined,
    lastScore: undefined,
  }
})
