import type { LiteratureExerciseSet } from './nvoLiteratureExercises'
import { literatureSummaries } from './literatureSummaries'
import { literatureWorks } from './literatureWorks'

type ExerciseSection = 'history' | 'title' | 'plot' | 'composition' | 'themes'

type SectionMap = Record<ExerciseSection, string[]>

type FactEntry = {
  section: ExerciseSection
  statement: string
}

const EXERCISE_PLAN: ExerciseSection[] = [
  'history',
  'history',
  'title',
  'title',
  'plot',
  'plot',
  'composition',
  'themes',
  'themes',
  'themes',
]

const SECTION_PROMPTS: Record<ExerciseSection, string[]> = {
  history: [
    'Кое твърдение за творческата история на „{title}“ е вярно?',
    'Кой контекст е свързан със създаването на „{title}“?',
  ],
  title: [
    'Кое твърдение за заглавието на „{title}“ е вярно?',
    'Коя интерпретация на заглавието на „{title}“ е най-точна?',
  ],
  plot: [
    'Кое твърдение най-точно описва сюжета на „{title}“?',
    'Кой е важен сюжетен или образен акцент в „{title}“?',
  ],
  composition: [
    'Кое твърдение за композицията на „{title}“ е вярно?',
    'Кой композиционен похват е съществен за „{title}“?',
  ],
  themes: [
    'Коя е водещата тема в „{title}“?',
    'Кой конфликт стои в центъра на „{title}“?',
    'Кое послание извежда „{title}“?',
    'Кое твърдение най-добре обобщава смисъла на „{title}“?',
  ],
}

function isHeading(line: string) {
  return /^[A-ZА-Я0-9„"() .,:;–-]+$/u.test(line.trim())
}

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim()
}

function splitIntoSentences(statement: string) {
  return statement
    .split(/(?<=[.!?])\s+(?=[A-ZА-Я„])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function shortenStatement(statement: string) {
  if (statement.length <= 260) return statement

  const sentences = splitIntoSentences(statement)
  if (sentences.length === 0) return `${statement.slice(0, 257).trimEnd()}...`

  let shortened = ''

  for (const sentence of sentences) {
    const candidate = shortened ? `${shortened} ${sentence}` : sentence

    if (candidate.length > 260 && shortened) break

    shortened = candidate

    if (shortened.length >= 170) break
  }

  if (!shortened) {
    return `${statement.slice(0, 257).trimEnd()}...`
  }

  return shortened.length < statement.length ? `${shortened}…` : shortened
}

function createEmptySections(): SectionMap {
  return {
    history: [],
    title: [],
    plot: [],
    composition: [],
    themes: [],
  }
}

function classifyHeading(line: string): ExerciseSection | null {
  if (line.includes('ТВОРЧЕСКА ИСТОРИЯ')) return 'history'
  if (line.includes('ЗАГЛАВИЕ')) return 'title'
  if (line.includes('ТЕМИ') || line.includes('ПОСЛАНИЯ') || line.includes('КОНФЛИКТИ')) return 'themes'
  if (line.includes('КОМПОЗИЦ') && line.includes('СЮЖЕТ')) return 'plot'
  if (line.includes('СЮЖЕТ')) return 'plot'
  if (line.includes('КОМПОЗИЦ')) return 'composition'
  return null
}

function parseSections(lines: string[]): SectionMap {
  const sections = createEmptySections()
  let currentSection: ExerciseSection = 'history'

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine)

    if (!line) continue

    if (isHeading(line)) {
      currentSection = classifyHeading(line) ?? currentSection
      continue
    }

    sections[currentSection].push(line)
  }

  return sections
}

function hashString(input: string) {
  let hash = 0
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

function pickDeterministic<T>(items: T[], count: number, seed: number): T[] {
  if (items.length <= count) return items.slice()

  const result: T[] = []
  const used = new Set<number>()
  let index = seed % items.length

  while (result.length < count) {
    if (!used.has(index)) {
      used.add(index)
      result.push(items[index])
    }
    index = (index + 7) % items.length
  }

  return result
}

const worksById = new Map(literatureWorks.map((work) => [work.id, work]))

const sectionsByWorkId = Object.fromEntries(
  Object.entries(literatureSummaries).map(([workId, summaryLines]) => [workId, parseSections(summaryLines)])
) as Record<string, SectionMap>

function buildFacts(workId: string): FactEntry[] {
  const sections = sectionsByWorkId[workId]
  if (!sections) return []

  return (Object.keys(sections) as ExerciseSection[]).flatMap((section) =>
    sections[section].map((statement) => ({ section, statement }))
  )
}

function getSectionDistractors(section: ExerciseSection, workId: string, correctStatement: string) {
  return Object.entries(sectionsByWorkId).flatMap(([candidateWorkId, sections]) => {
    if (candidateWorkId === workId) return []

    return sections[section]
      .filter((statement) => statement !== correctStatement)
      .map((statement) => ({ section, statement }))
  })
}

function getFallbackDistractors(workId: string, correctStatement: string) {
  return Object.entries(sectionsByWorkId).flatMap(([candidateWorkId, sections]) => {
    if (candidateWorkId === workId) return []

    return (Object.keys(sections) as ExerciseSection[]).flatMap((section) =>
      sections[section]
        .filter((statement) => statement !== correctStatement)
        .map((statement) => ({ section, statement }))
    )
  })
}

function buildExercise(workId: string): LiteratureExerciseSet | null {
  const work = worksById.get(workId)
  const facts = buildFacts(workId)

  if (!work || facts.length === 0) return null

  const sectionUsage = createEmptySections()

  const questions = EXERCISE_PLAN.map((plannedSection, questionIndex) => {
    const factsForSection = facts.filter((fact) => fact.section === plannedSection)
    const fallbackFact = facts[questionIndex % facts.length]
    const fact =
      factsForSection[sectionUsage[plannedSection].length % Math.max(factsForSection.length, 1)] ?? fallbackFact

    sectionUsage[fact.section].push(fact.statement)

    const prompts = SECTION_PROMPTS[fact.section]
    const promptIndex = (sectionUsage[fact.section].length - 1) % prompts.length
    const question = prompts[promptIndex].replace('{title}', work.title)

    const sectionDistractors = getSectionDistractors(fact.section, workId, fact.statement)
    const fallbackDistractors = getFallbackDistractors(workId, fact.statement)
    const distractorPool = sectionDistractors.length >= 3 ? sectionDistractors : fallbackDistractors
    const distractors = pickDeterministic(
      distractorPool,
      3,
      hashString(`${workId}-${questionIndex}-${fact.section}-${fact.statement}`)
    )

    const optionTexts = distractors.map((distractor) => distractor.statement)

    return {
      question,
      options: {
        A: shortenStatement(fact.statement),
        B: shortenStatement(optionTexts[0]),
        C: shortenStatement(optionTexts[1]),
        D: shortenStatement(optionTexts[2]),
      },
      correct_answer: 'A' as const,
      explanation: `В материала за произведението е посочено: ${fact.statement}`,
    }
  })

  return {
    author: work.author,
    title: work.title,
    genre: 'Литературно произведение',
    summary: `Упражнение по „${work.title}“ за 12. клас.`,
    themes: [work.theme],
    questions,
  }
}

const exerciseByWorkId = Object.fromEntries(
  literatureWorks
    .map((work) => [work.id, buildExercise(work.id)] as const)
    .filter((entry): entry is [string, LiteratureExerciseSet] => entry[1] !== null)
) as Record<string, LiteratureExerciseSet>

export function getDziExerciseForWork(workId: string): LiteratureExerciseSet | null {
  return exerciseByWorkId[workId] ?? null
}
