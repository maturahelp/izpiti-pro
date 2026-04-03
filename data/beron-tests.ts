import beronGrade7TestsData from './beron_grade7_tests.json'
import beronGrade12TestsData from './beron_grade12_tests.json'
import type { Difficulty, Test } from './tests'

interface BeronQuestion {
  id: string
  grade: number
  rule_id: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'multiple_choice' | 'choose_correct_form' | 'fill_in_blank' | 'find_the_error' | 'edit_sentence' | 'explain_rule'
  question_text: string
  options?: string[]
  correct_answer: string
  explanation: string
  source_rule_title: string
  tags: string[]
}

interface BeronDifficultyTest {
  id: string
  bank: 'g7' | 'g12'
  bank_label: string
  difficulty: 'easy' | 'medium' | 'hard'
  difficulty_label: string
  title: string
  question_count: number
  topics: string[]
  rule_ids: string[]
  questions: BeronQuestion[]
}

export interface BeronExamPayload {
  tests: BeronDifficultyTest[]
}

const grade7Tests = beronGrade7TestsData as BeronDifficultyTest[]
const grade12Tests = beronGrade12TestsData as BeronDifficultyTest[]

export const beronExamPayload: BeronExamPayload = {
  tests: [...grade7Tests, ...grade12Tests],
}

const difficultyMap: Record<BeronDifficultyTest['difficulty'], Difficulty> = {
  easy: 'лесен',
  medium: 'среден',
  hard: 'труден',
}

export const beronTests: Test[] = beronExamPayload.tests.map((test) => {
  const isGrade7 = test.bank === 'g7'

  return {
    id: `beron_${test.id}`,
    title: `BERON · ${test.title}`,
    subjectId: isGrade7 ? 'bg-lang-7' : 'bg-lang-12',
    subjectName: isGrade7 ? 'Български език' : 'Български език и литература',
    topicId: isGrade7 ? 'bg7-1' : 'bg12-1',
    topicName: isGrade7 ? 'Правопис и пунктуация' : 'Стилистика и изразни средства',
    examType: isGrade7 ? 'nvo7' : 'dzi12',
    difficulty: difficultyMap[test.difficulty],
    questionsCount: test.question_count,
    timeMinutes: isGrade7 ? 35 : 40,
    isPremium: false,
    completedCount: 0,
    avgScore: 0,
    status: 'not_started',
    completedAt: undefined,
    lastScore: undefined,
  }
})
