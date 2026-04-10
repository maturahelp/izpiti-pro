import bankRaw from './nvoLiteratureQuestionBank.json'

export interface LiteratureQuestion {
  question: string
  options: { A: string; B: string; C: string; D: string }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface LiteratureExerciseSet {
  author: string
  title: string
  genre: string
  summary: string
  themes: string[]
  questions: LiteratureQuestion[]
}

// Raw bank is an array of works; cast it to a typed array.
const bank = bankRaw as Array<{
  author: string
  title: string
  genre: string
  summary: string
  themes: string[]
  questions: LiteratureQuestion[]
}>

/**
 * Maps each nvoLiteratureWorks id (e.g. 'nvo-lit-07') to the index of its
 * matching entry in the question bank JSON.
 */
const workIdToBankIndex: Record<string, number> = {
  'nvo-lit-01': 10, // Вятър ечи, Балкан стене — Добри Чинтулов
  'nvo-lit-02': 9,  // Стани, стани, юнак балкански — Добри Чинтулов
  'nvo-lit-03': 2,  // Отечество любезно — Иван Вазов
  'nvo-lit-04': 1,  // Хубава си, моя горо — Любен Каравелов
  'nvo-lit-05': 18, // Неразделни — Пенчо Славейков
  'nvo-lit-06': 11, // На прощаване в 1868 г. — Христо Ботев
  'nvo-lit-07': 0,  // Хайдути — Христо Ботев
  'nvo-lit-08': 19, // Заточеници — Пейо Яворов
  'nvo-lit-09': 12, // Немили-недраги — Иван Вазов
  'nvo-lit-10': 14, // Опълченците на Шипка — Иван Вазов
  'nvo-lit-11': 5,  // Под игото: Представлението — Иван Вазов
  'nvo-lit-12': 6,  // Под игото: Радини вълнения — Иван Вазов
  'nvo-lit-13': 15, // Българският език — Иван Вазов
  'nvo-lit-14': 13, // Една българка — Иван Вазов
  'nvo-lit-15': 16, // До Чикаго и назад — Алеко Константинов
  'nvo-lit-16': 17, // Бай Ганьо пътува — Алеко Константинов
  'nvo-lit-17': 21, // По жицата — Йордан Йовков
  'nvo-lit-18': 8,  // Серафим — Йордан Йовков
  'nvo-lit-19': 20, // По жътва — Елин Пелин
  'nvo-lit-20': 3,  // Косачи — Елин Пелин
  'nvo-lit-21': 7,  // Братчетата на Гаврош — Христо Смирненски
  'nvo-lit-22': 4,  // Художник — Веселин Ханчев
}

export function getExerciseForWork(workId: string): LiteratureExerciseSet | null {
  const index = workIdToBankIndex[workId]
  if (index === undefined) return null
  const entry = bank[index]
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
