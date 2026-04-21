import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { literatureSummaries } from '../data/literatureSummaries'
import { literatureWorks } from '../data/literatureWorks'
import {
  DZI_LITERATURE_EXERCISE_BLUEPRINTS,
  DZI_TRANSCRIPT_DIR,
  type DziLiteratureExerciseBlueprint,
} from './dzi-literature-exercise-blueprints'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(ROOT, 'data', 'dziLiteratureQuestionBank.json')

type OptionKey = 'A' | 'B' | 'C' | 'D'

type BankQuestion = {
  question: string
  options: Record<OptionKey, string>
  correct_answer: OptionKey
  explanation: string
}

type BankEntry = {
  grade: number
  unit: string
  author: string
  title: string
  genre: string
  text: string
  summary: string
  themes: string[]
  motifs: string[]
  characters: string[]
  source_file: string
  questions: BankQuestion[]
}

const SECTION_HEADINGS = new Set([
  'ТВОРЧЕСКА ИСТОРИЯ',
  'ЗАГЛАВИЕ',
  'СЮЖЕТНИ И КОМПОЗИЦИОННИ ОСОБЕНОСТИ',
  'КОМПОЗИЦИЯ',
  'ТЕМИ, КОНФЛИКТИ И ПОСЛАНИЯ',
])

const GENERIC_FALSE_CONFLICTS = [
  'между случайно битово недоразумение и неговото безболезнено разрешаване',
  'между желанието за бездействие и липсата на нравствен избор',
  'между личната изгода и свят, в който липсва какъвто и да е обществен проблем',
]

const GENERIC_FALSE_TITLE_OPTIONS = [
  'Заглавието няма смислова функция и е избрано случайно.',
  'Заглавието подвежда читателя, защото няма връзка с идеите на текста.',
  'Заглавието назовава случаен детайл, който не участва в изграждането на смисъла.',
]

const GENERIC_FALSE_CHARACTER_OPTIONS = [
  'Този образ присъства случайно и няма съществена роля за смисъла на произведението.',
  'Този образ е изграден така, че да остане напълно без връзка с темите и мотивите на творбата.',
  'Този образ не концентрира никакво ценностно напрежение и остава смислово неутрален.',
]

const GENERIC_FALSE_CONTENT_OPTIONS = [
  'Текстът представя свят без съществено изпитание, в който конфликтът остава напълно отсъстващ.',
  'Произведението внушава, че личната изгода е по-важна от общността и моралния избор.',
  'Творбата представя героите като лишени от ценностен избор и вътрешна промяна.',
]

const GENERIC_FALSE_MESSAGE_OPTIONS = [
  'човекът трябва да приеме неправдата като естествен ред и да избягва всяка съпротива',
  'личната изгода стои над общността, паметта и нравствения избор',
  'светът е лишен от ценностни конфликти и не изисква духовно усилие',
]

const GENERIC_FALSE_INTERPRETATION_OPTIONS = [
  'Произведението няма съществена връзка между теми, образи и внушения.',
  'Текстът допуска единствено буквален прочит и не предполага интерпретация.',
  'Смисълът на творбата се изчерпва с единичен факт и не изгражда по-широк ценностен хоризонт.',
]

function rotatePick(pool: string[], correct: string, count: number, seed: number): string[] {
  const filtered = pool.filter((item) => item !== correct)
  const picks: string[] = []
  let index = seed % filtered.length

  while (picks.length < count) {
    const candidate = filtered[index]
    if (!picks.includes(candidate)) {
      picks.push(candidate)
    }
    index = (index + 1) % filtered.length
  }

  return picks
}

function parseSections(parts: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {}
  let currentHeading: string | null = null

  for (const part of parts) {
    if (SECTION_HEADINGS.has(part)) {
      currentHeading = part
      sections[currentHeading] = []
      continue
    }

    if (currentHeading) {
      sections[currentHeading].push(part)
    }
  }

  return sections
}

function normalizeStatement(value: string): string {
  return value.trim().replace(/^([a-zа-я])/u, (character) => character.toLocaleUpperCase('bg-BG'))
}

function extractPrefixParagraph(paragraphs: string[], prefix: string): string {
  const directParagraph = paragraphs.find((item) => item.startsWith(prefix))
  if (directParagraph) {
    const extracted = directParagraph.slice(prefix.length).trim()
    return prefix === 'Послание:' ? normalizeStatement(extracted) : extracted
  }

  const fallbackMatchers: Record<string, RegExp[]> = {
    'Основна тема:': [
      /^Основната тема(?:\s+в\s+творбата)?\s+е\s+/,
      /^Основна тема\s*[:\-]\s*/i,
    ],
    'Конфликт:': [
      /^Основният конфликт\s+е\s+/,
      /^Един от най-силните конфликти\s+е\s+/,
      /^Конфликтът\s+е\s+/,
      /^Конфликт\s*[:\-]\s*/i,
    ],
    'Послание:': [
      /^Посланието(?:\s+на\s+.+?)?\s+е\s+ясно:\s*/i,
      /^Посланието(?:\s+на\s+.+?)?\s+е,\s+че\s*/i,
      /^Посланието(?:\s+на\s+.+?)?\s+е:\s*/i,
      /^Посланието(?:\s+на\s+.+?)?\s+е\s+/i,
      /^Послание\s*[:\-]\s*/i,
    ],
  }

  const matchers = fallbackMatchers[prefix] ?? []

  for (const paragraph of paragraphs) {
    for (const matcher of matchers) {
      if (matcher.test(paragraph)) {
        const extracted = paragraph.replace(matcher, '').trim()
        return prefix === 'Послание:' ? normalizeStatement(extracted) : extracted
      }
    }
  }

  assert(false, `Missing "${prefix}" paragraph in literature summary.`)
}

function buildSummaryParagraph(sections: Record<string, string[]>): string {
  const contentParagraphs = sections['СЮЖЕТНИ И КОМПОЗИЦИОННИ ОСОБЕНОСТИ'] ?? []
  const summaryParts = contentParagraphs.slice(0, 2)
  assert(summaryParts.length > 0, 'Expected content paragraphs for summary generation.')
  return summaryParts.join(' ')
}

function buildThemes(workTheme: string, primaryTheme: string): string[] {
  return [primaryTheme, workTheme, 'литературен анализ']
}

function buildGenreQuestion(title: string, genre: string, genrePool: string[], seed: number): BankQuestion {
  const distractors = rotatePick(genrePool, genre, 3, seed)
  return {
    question: `Към кой жанр принадлежи „${title}“?`,
    options: { A: genre, B: distractors[0], C: distractors[1], D: distractors[2] },
    correct_answer: 'A',
    explanation: 'Жанровите белези на творбата определят правилния отговор.',
  }
}

function buildThemeQuestion(title: string, primaryTheme: string, themePool: string[], seed: number): BankQuestion {
  const distractors = rotatePick(themePool, primaryTheme, 3, seed)
  return {
    question: `Коя тема е водеща в „${title}“?`,
    options: { A: distractors[0], B: primaryTheme, C: distractors[1], D: distractors[2] },
    correct_answer: 'B',
    explanation: 'Тази тема организира основния ценностен и художествен хоризонт на произведението.',
  }
}

function buildMotifQuestion(title: string, motif: string, motifPool: string[], seed: number): BankQuestion {
  const distractors = rotatePick(motifPool, motif, 3, seed)
  return {
    question: `Кой мотив или символ има ключова роля за смисъла на „${title}“?`,
    options: { A: distractors[0], B: distractors[1], C: motif, D: distractors[2] },
    correct_answer: 'C',
    explanation: 'Посоченият мотив участва пряко в изграждането на темите и внушенията на творбата.',
  }
}

function buildConflictQuestion(title: string, conflict: string): BankQuestion {
  return {
    question: `Кое твърдение най-точно формулира основния конфликт в „${title}“?`,
    options: {
      A: GENERIC_FALSE_CONFLICTS[0],
      B: conflict,
      C: GENERIC_FALSE_CONFLICTS[1],
      D: GENERIC_FALSE_CONFLICTS[2],
    },
    correct_answer: 'B',
    explanation: 'Точно този конфликт организира основното напрежение и движи смисловото развитие на текста.',
  }
}

function buildTitleQuestion(title: string, titleMeaning: string): BankQuestion {
  return {
    question: `Каква е ролята на заглавието „${title}“ за смисъла на произведението?`,
    options: {
      A: titleMeaning,
      B: GENERIC_FALSE_TITLE_OPTIONS[0],
      C: GENERIC_FALSE_TITLE_OPTIONS[1],
      D: GENERIC_FALSE_TITLE_OPTIONS[2],
    },
    correct_answer: 'A',
    explanation: 'Заглавието е смислов ключ към основния образ, проблем или символен център на творбата.',
  }
}

function buildCharacterQuestion(title: string, centralFigure: string): BankQuestion {
  return {
    question: `Кое твърдение е вярно за образа на ${centralFigure} в „${title}“?`,
    options: {
      A: GENERIC_FALSE_CHARACTER_OPTIONS[0],
      B: `${centralFigure} е носител на основното ценностно и сюжетно напрежение в произведението.`,
      C: GENERIC_FALSE_CHARACTER_OPTIONS[1],
      D: GENERIC_FALSE_CHARACTER_OPTIONS[2],
    },
    correct_answer: 'B',
    explanation: 'Централният образ концентрира най-важните избори, ценности или внушения в текста.',
  }
}

function buildContentQuestion(title: string, contentStatement: string): BankQuestion {
  return {
    question: `Кое твърдение съответства на съдържанието и внушенията на „${title}“?`,
    options: {
      A: GENERIC_FALSE_CONTENT_OPTIONS[0],
      B: contentStatement,
      C: GENERIC_FALSE_CONTENT_OPTIONS[1],
      D: GENERIC_FALSE_CONTENT_OPTIONS[2],
    },
    correct_answer: 'B',
    explanation: 'Само този отговор предава вярно основните наблюдения върху сюжета, образите или лирическото развитие.',
  }
}

function buildToneQuestion(title: string, tone: string, tonePool: string[], seed: number): BankQuestion {
  const distractors = rotatePick(tonePool, tone, 3, seed)
  return {
    question: `Кой израз най-точно характеризира доминиращия тон в „${title}“?`,
    options: { A: distractors[0], B: tone, C: distractors[1], D: distractors[2] },
    correct_answer: 'B',
    explanation: 'Тонът се разпознава по отношението към образите, конфликта и ценностните внушения на творбата.',
  }
}

function buildMessageQuestion(title: string, message: string): BankQuestion {
  return {
    question: `Кое послание защитава „${title}“?`,
    options: {
      A: message,
      B: GENERIC_FALSE_MESSAGE_OPTIONS[0],
      C: GENERIC_FALSE_MESSAGE_OPTIONS[1],
      D: GENERIC_FALSE_MESSAGE_OPTIONS[2],
    },
    correct_answer: 'A',
    explanation: 'Посланието обобщава ценностите, които произведението утвърждава или проблематизира.',
  }
}

function buildInterpretationQuestion(title: string, primaryTheme: string, motif: string): BankQuestion {
  return {
    question: `Кой извод е най-подходящ за интерпретация на „${title}“ в зрелостен изпит?`,
    options: {
      A: GENERIC_FALSE_INTERPRETATION_OPTIONS[0],
      B: `Творбата изгражда темата „${primaryTheme}“ чрез ключовия образ или символ „${motif}“.`,
      C: GENERIC_FALSE_INTERPRETATION_OPTIONS[1],
      D: GENERIC_FALSE_INTERPRETATION_OPTIONS[2],
    },
    correct_answer: 'B',
    explanation: 'Добрата интерпретация свързва теми, образи и художествени внушения в цялостен извод.',
  }
}

function buildEntries(): BankEntry[] {
  const blueprintById = new Map(
    DZI_LITERATURE_EXERCISE_BLUEPRINTS.map((item) => [item.workId, item] as const)
  )
  const transcriptFiles = new Set(DZI_LITERATURE_EXERCISE_BLUEPRINTS.map((item) => item.sourceSlug))

  assert.equal(DZI_LITERATURE_EXERCISE_BLUEPRINTS.length, 27, 'Expected 27 DZI exercise blueprints.')
  assert.equal(literatureWorks.length, 27, 'Expected 27 DZI literature works.')

  const genrePool = [...new Set(DZI_LITERATURE_EXERCISE_BLUEPRINTS.map((item) => item.genre))]
  const themePool = [...new Set(DZI_LITERATURE_EXERCISE_BLUEPRINTS.map((item) => item.primaryTheme))]
  const motifPool = [...new Set(DZI_LITERATURE_EXERCISE_BLUEPRINTS.map((item) => item.motif))]
  const tonePool = [...new Set(DZI_LITERATURE_EXERCISE_BLUEPRINTS.map((item) => item.tone))]

  return literatureWorks.map((work, index) => {
    const blueprint = blueprintById.get(work.id)
    assert(blueprint, `Missing blueprint for ${work.id}.`)
    assert(transcriptFiles.has(blueprint.sourceSlug), `Missing transcript mapping for ${work.id}.`)

    const summaryParts = literatureSummaries[work.id]
    assert(summaryParts, `Missing literature summary for ${work.id}.`)

    const sections = parseSections(summaryParts)
    const titleMeaning = (sections['ЗАГЛАВИЕ'] ?? [])[0]
    const themesSection = sections['ТЕМИ, КОНФЛИКТИ И ПОСЛАНИЯ'] ?? []

    assert(titleMeaning, `Missing title section for ${work.id}.`)
    assert(themesSection.length > 0, `Missing theme section for ${work.id}.`)

    const conflict = extractPrefixParagraph(themesSection, 'Конфликт:')
    const message = extractPrefixParagraph(themesSection, 'Послание:')
    const contentStatement = buildSummaryParagraph(sections)

    const questions: BankQuestion[] = [
      buildGenreQuestion(work.title, blueprint.genre, genrePool, index),
      buildThemeQuestion(work.title, blueprint.primaryTheme, themePool, index),
      buildMotifQuestion(work.title, blueprint.motif, motifPool, index),
      buildConflictQuestion(work.title, conflict),
      buildTitleQuestion(work.title, titleMeaning),
      buildCharacterQuestion(work.title, blueprint.centralFigure),
      buildContentQuestion(work.title, contentStatement),
      buildToneQuestion(work.title, blueprint.tone, tonePool, index),
      buildMessageQuestion(work.title, message),
      buildInterpretationQuestion(work.title, blueprint.primaryTheme, blueprint.motif),
    ]

    assert.equal(questions.length, 10, `Expected 10 generated questions for ${work.id}.`)

    return {
      grade: 12,
      unit: work.theme,
      author: work.author,
      title: work.title,
      genre: blueprint.genre,
      text: '',
      summary: contentStatement,
      themes: buildThemes(work.theme, blueprint.primaryTheme),
      motifs: [blueprint.motif],
      characters: [blueprint.centralFigure],
      source_file: `12-grade-literature-transcripts/${blueprint.sourceSlug}.txt`,
      questions,
    }
  })
}

async function validateOutputFile(entries: BankEntry[]): Promise<void> {
  const outputRaw = await fs.readFile(OUTPUT_PATH, 'utf8')
  const output = JSON.parse(outputRaw) as BankEntry[]

  assert.equal(output.length, 27, 'Expected 27 generated DZI literature exercise entries.')
  assert.deepEqual(output, entries, 'Generated bank differs from committed JSON output.')

  for (const entry of output) {
    assert.equal(entry.questions.length, 10, `Expected 10 questions in ${entry.title}.`)

    for (const question of entry.questions) {
      assert.equal(Object.keys(question.options).length, 4, `Expected 4 options for ${entry.title}.`)
      assert(['A', 'B', 'C', 'D'].includes(question.correct_answer), `Invalid correct answer for ${entry.title}.`)
    }

    const transcriptPath = path.join('/Users/danielmladenov/Desktop', entry.source_file)
    await fs.access(transcriptPath)
  }
}

async function validateResolver(): Promise<void> {
  const { resolveLiteratureExercisePage } = await import('../data/literatureExerciseResolver')

  const nvoExample = resolveLiteratureExercisePage('nvo-lit-01')
  assert(nvoExample, 'Expected NVO literature exercise resolver to return data.')
  assert.equal(nvoExample.grade, 7, 'Expected NVO resolver grade to remain 7.')

  const dziExample = resolveLiteratureExercisePage('lit-01')
  assert(dziExample, 'Expected DZI literature exercise resolver to return data.')
  assert.equal(dziExample.grade, 12, 'Expected DZI resolver grade to be 12.')
  assert.equal(dziExample.exercise.questions.length, 10, 'Expected DZI resolver to expose 10 questions.')
}

async function main(): Promise<void> {
  const entries = buildEntries()

  if (process.argv.includes('--write')) {
    await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
    console.log(`Wrote ${entries.length} DZI literature exercise entries to ${path.relative(ROOT, OUTPUT_PATH)}.`)
    return
  }

  await validateOutputFile(entries)
  await validateResolver()

  console.log('DZI literature exercises validated.')
  console.log(`Entries: ${entries.length}`)
  console.log(`Transcript coverage: ${DZI_LITERATURE_EXERCISE_BLUEPRINTS.length}/27`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
