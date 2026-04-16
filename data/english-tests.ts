import {
  generatedEnglishMaterialSections,
  generatedEnglishReadingQuestionCount,
  generatedEnglishWritingQuestionCount,
} from '../lib/english-generated-materials'
import { officialEnglishMockExams } from '../lib/official-english-mock-data'
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

const officialEnglishTests: Test[] = officialEnglishMockExams.map((exam, index) => {
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

const generatedReadingTests: Test[] = generatedEnglishMaterialSections
  .filter((section) => section.mode === 'reading')
  .map((section, index) => ({
    id: `english-generated-${section.id}`,
    title: section.title.replace(/^Reading Passage/, 'Примерен reading тест'),
    subjectId: 'eng-12',
    subjectName: 'Английски език',
    topicId: 'eng12-generated-reading',
    topicName: 'ДЗИ — Примерен reading',
    examType: 'dzi12',
    difficulty: 'среден',
    questionsCount: section.questions.length,
    timeMinutes: 20,
    isPremium: false,
    completedCount: Math.max(0, 520 - index * 4),
    avgScore: Math.max(60, 76 - (index % 6)),
    status: 'not_started',
  }))

const generatedWritingTest: Test = {
  id: 'english-generated-writing',
  title: 'Примерен writing банк — 50 теми за ДЗИ',
  subjectId: 'eng-12',
  subjectName: 'Английски език',
  topicId: 'eng12-generated-writing',
  topicName: 'ДЗИ — Примерен writing',
  examType: 'dzi12',
  difficulty: 'труден',
  questionsCount: generatedEnglishWritingQuestionCount,
  timeMinutes: 60,
  isPremium: false,
  completedCount: 318,
  avgScore: 72,
  status: 'not_started',
}

export const englishTests: Test[] = [
  ...generatedReadingTests,
  generatedWritingTest,
  ...officialEnglishTests,
]

export const englishTestsSummary = {
  officialCount: officialEnglishTests.length,
  generatedReadingCount: generatedReadingTests.length,
  generatedReadingQuestionCount: generatedEnglishReadingQuestionCount,
  generatedWritingQuestionCount: generatedEnglishWritingQuestionCount,
}
