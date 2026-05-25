// Калкулатор за минимален бал — централизирани константи.
// Сменяй стойностите тук, когато се качват данни за нова приемна година.

import paralelkiData from '@/data/paralelki_2025.json'

export const PRIEM_YEAR = 2025

// Точкова таблица за оценки от свидетелството за основно образование.
// Слаб (2) не е допустим за прием — затова не присъства тук.
export const GRADE_POINTS = {
  excellent_6: 50, // Отличен (6)
  very_good_5: 39, // Много добър (5)
  good_4: 26,      // Добър (4)
  average_3: 15,   // Среден (3)
} as const

export type GradeKey = keyof typeof GRADE_POINTS

export const GRADE_OPTIONS: ReadonlyArray<{
  key: GradeKey
  label: string
  points: number
}> = [
  { key: 'excellent_6', label: 'Отличен (6)', points: GRADE_POINTS.excellent_6 },
  { key: 'very_good_5', label: 'Много добър (5)', points: GRADE_POINTS.very_good_5 },
  { key: 'good_4', label: 'Добър (4)', points: GRADE_POINTS.good_4 },
  { key: 'average_3', label: 'Среден (3)', points: GRADE_POINTS.average_3 },
]

export const MAX_NVO_SCORE = 100
export const MAX_BAL = 500

/** Изчислява бал по формулата:
 *  бал = 2 × НВО БЕЛ + 2 × НВО Математика + точки_оценка_1 + точки_оценка_2
 */
export function computeBal(args: {
  nvoBel: number
  nvoMath: number
  grade1: GradeKey
  grade2: GradeKey
}): number {
  const { nvoBel, nvoMath, grade1, grade2 } = args
  const bal =
    2 * nvoBel +
    2 * nvoMath +
    GRADE_POINTS[grade1] +
    GRADE_POINTS[grade2]
  // Закръгляме до 2 десетични знака, за да избегнем floating-point шум.
  return Math.round(bal * 100) / 100
}

export type Paralelka = {
  name: string
  min_bal_obshto: number
  min_bal_men: number | null
  min_bal_women: number | null
  max_bal_obshto: number | null
  max_bal_men: number | null
  source_page: number
}

export type ParalelkiDataset = {
  metadata: {
    source: string
    source_authority: string
    as_of: string
    extracted_pages: number[]
    row_count: number
    unique_names: number
    duplicate_name_count: number
    columns: string[]
    note: string
  }
  paralelki: Paralelka[]
}

export const PARALELKI_DATASET = paralelkiData as unknown as ParalelkiDataset

// Стойностите 0 в pol-specific колоните идват от празни клетки в PDF-а —
// нормализираме ги към null, за да не подвеждат UI-я.
function nullifyZero(value: number | null): number | null {
  return value === 0 ? null : value
}

export type IndexedParalelka = Paralelka & {
  id: string
  occurrences: number
}

// Едно и също име може да се появи в няколко училища. Запазваме целия
// ред с най-нисък общ минимален бал (най-лесният за влизане) и броим
// останалите срещания — НЕ смесваме min от един ред с max от друг.
function buildUniqueParalelki(): IndexedParalelka[] {
  const byName = new Map<string, IndexedParalelka>()
  for (let i = 0; i < PARALELKI_DATASET.paralelki.length; i++) {
    const raw = PARALELKI_DATASET.paralelki[i]
    const p: Paralelka = {
      ...raw,
      min_bal_men: nullifyZero(raw.min_bal_men),
      min_bal_women: nullifyZero(raw.min_bal_women),
      max_bal_men: nullifyZero(raw.max_bal_men),
    }
    const existing = byName.get(p.name)
    if (!existing) {
      byName.set(p.name, { ...p, id: `${p.name}#${i}`, occurrences: 1 })
      continue
    }
    existing.occurrences += 1
    if (p.min_bal_obshto < existing.min_bal_obshto) {
      // Запазваме целия ред с най-нисък мин. бал, за да не комбинираме
      // полета от различни редове.
      Object.assign(existing, p)
    }
  }
  return Array.from(byName.values()).sort(
    (a, b) => b.min_bal_obshto - a.min_bal_obshto,
  )
}

export const UNIQUE_PARALELKI: ReadonlyArray<IndexedParalelka> = buildUniqueParalelki()

export function formatBal(value: number): string {
  // 462 -> "462", 462.5 -> "462.5", 462.25 -> "462.25"
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '')
}

export function formatGap(diff: number): string {
  const sign = diff >= 0 ? '+' : '−'
  return `${sign}${formatBal(Math.abs(diff))}`
}
