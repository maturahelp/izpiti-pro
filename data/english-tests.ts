import { officialEnglishMockExams } from '@/lib/official-english-mock-data'
import type { Test } from './tests'

const sessionLabelMap: Record<string, string> = {
  май: 'Май',
  юни: 'Юни',
  август: 'Август',
  септември: 'Септември',
  примерна: 'Примерна',
  пробна: 'Пробна',
}

function estimateEnglishTimeMinutes(questionCount: number): number {
  if (questionCount >= 55) return 240
  if (questionCount >= 35) return 180
  return 60
}

export const englishTests: Test[] = officialEnglishMockExams.map((exam, index) => {
  const sessionLabel = sessionLabelMap[exam.session || ''] || exam.session || 'Сесия'
  const levelLabel = exam.level ? ` ${exam.level}` : ''

  return {
    id: exam.id,
    title: `ДЗИ Английски език${levelLabel} — ${sessionLabel} ${exam.year}`,
    subjectId: 'eng-12',
    subjectName: 'Английски език',
    topicId: 'eng12-official-dzi',
    topicName: 'ДЗИ — Официален изпит',
    examType: 'dzi12',
    difficulty: exam.level === 'B2' ? 'труден' : 'среден',
    questionsCount: exam.questions.length,
    timeMinutes: estimateEnglishTimeMinutes(exam.questions.length),
    isPremium: false,
    completedCount: Math.max(0, 1640 - index * 37),
    avgScore: Math.max(58, 78 - (index % 8)),
    status: 'not_started',
  }
})
