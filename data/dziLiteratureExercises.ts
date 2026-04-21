import bankRaw from './dziLiteratureQuestionBank.json'
import { literatureWorks } from './literatureWorks'
import type { LiteratureExerciseSet } from './nvoLiteratureExercises'

type DziLiteratureBankEntry = LiteratureExerciseSet & {
  grade: number
  unit: string
  text: string
  motifs: string[]
  characters: string[]
  source_file: string
}

const bank = bankRaw as DziLiteratureBankEntry[]

const bankByTitle = new Map(bank.map((entry) => [entry.title, entry] as const))
const workIdToTitle = new Map(literatureWorks.map((work) => [work.id, work.title] as const))

export function getDziExerciseForWork(workId: string): LiteratureExerciseSet | null {
  const title = workIdToTitle.get(workId)
  if (!title) return null

  const entry = bankByTitle.get(title)
  if (!entry) return null

  return {
    author: entry.author,
    title: entry.title,
    genre: entry.genre,
    summary: entry.summary,
    themes: entry.themes,
    questions: entry.questions,
  }
}
