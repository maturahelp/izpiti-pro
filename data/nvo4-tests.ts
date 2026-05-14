import officialNvo4Dataset from './official_nvo4_dataset.json'
import mockNvo4PracticeDataset from './mock_nvo4_exam_practice.json'
import type { Test } from './tests'

type Nvo4Exam = {
  id: string
  year: number
  subject: string
  source_title?: string
  title?: string
  exam_type: 'nvo4_bel' | 'nvo4_math'
  questions: Array<{ number: number }>
}

const subjectMeta = {
  nvo4_bel: {
    id: 'bg-lang-4',
    name: 'Български език и литература',
    topicId: 'bg4-nvo',
    topicName: 'НВО — Пълен изпит',
    titleSubject: 'Български език',
  },
  nvo4_math: {
    id: 'math-4',
    name: 'Математика',
    topicId: 'math4-nvo',
    topicName: 'НВО — Пълен изпит',
    titleSubject: 'Математика',
  },
} satisfies Record<Nvo4Exam['exam_type'], {
  id: string
  name: string
  topicId: string
  topicName: string
  titleSubject: string
}>

function testIdForExam(exam: Nvo4Exam) {
  const subjectSlug = exam.exam_type === 'nvo4_math' ? 'math' : 'bel'
  return `nvo4-${subjectSlug}-${exam.year}`
}

const officialNvo4Tests: Test[] = (officialNvo4Dataset as Nvo4Exam[]).map((exam, index) => {
  const meta = subjectMeta[exam.exam_type]
  return {
    id: testIdForExam(exam),
    title: `НВО ${meta.titleSubject} — изпит ${exam.year}`,
    subjectId: meta.id,
    subjectName: meta.name,
    topicId: meta.topicId,
    topicName: meta.topicName,
    examType: 'nvo4',
    difficulty: exam.year >= 2024 ? 'среден' : 'лесен',
    questionsCount: exam.questions.length,
    timeMinutes: 60,
    isPremium: false,
    completedCount: Math.max(0, 2400 - index * 37),
    avgScore: exam.exam_type === 'nvo4_math' ? 68 : 74,
  }
})

const mockNvo4Tests: Test[] = ((mockNvo4PracticeDataset as { exams: Nvo4Exam[] }).exams).map((exam) => {
  const meta = subjectMeta[exam.exam_type]
  const isModel = exam.id.endsWith('_model')
  const isGenerated = exam.id.startsWith('generated_nvo4_')
  return {
    id: exam.id,
    title: exam.title || exam.source_title || `Примерен НВО ${meta.titleSubject}`,
    subjectId: meta.id,
    subjectName: meta.name,
    topicId: `${meta.topicId}-model`,
    topicName: isGenerated ? 'НВО — Пробен тест' : isModel ? 'НВО — Модел' : 'НВО — Примерен изпит',
    examType: 'nvo4',
    difficulty: 'среден',
    questionsCount: exam.questions.length,
    timeMinutes: 60,
    isPremium: false,
    completedCount: 0,
    avgScore: 0,
    status: 'not_started',
  }
})

export const nvo4Tests: Test[] = [...officialNvo4Tests, ...mockNvo4Tests]
