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
  return Math.round(bal * 100) / 100
}

export type ParalelkaRecord = {
  row_no: number
  school_code: string
  school_name: string
  paralelka_code: string
  paralelka_name: string
  min_bal_obshto: number
  min_bal_men: number | null
  min_bal_women: number | null
  max_bal_obshto: number | null
  max_bal_men: number | null
  source_page_school: number
  source_page_bal: number
}

export type ParalelkiDataset = {
  metadata: {
    source: string
    source_authority: string
    as_of: string
    school_pages: number[]
    bal_pages: number[]
    row_count: number
    unique_paralelki_names: number
    unique_schools: number
    join_method: string
    note: string
  }
  records: ParalelkaRecord[]
}

export const PARALELKI_DATASET = paralelkiData as unknown as ParalelkiDataset

// 0 в pol-specific колоните идва от празни клетки в PDF-а — нормализираме
// към null, за да не подвеждат UI-я.
function nullifyZero(value: number | null): number | null {
  return value === 0 ? null : value
}

export type IndexedRecord = ParalelkaRecord & { id: string }

function buildAllRecords(): IndexedRecord[] {
  return PARALELKI_DATASET.records.map((r) => ({
    ...r,
    min_bal_men: nullifyZero(r.min_bal_men),
    min_bal_women: nullifyZero(r.min_bal_women),
    max_bal_men: nullifyZero(r.max_bal_men),
    id: `${r.row_no}`,
  }))
}

// Всички 385 (училище × паралелка) комбинации, подредени по най-висок мин. бал.
export const ALL_RECORDS: ReadonlyArray<IndexedRecord> = buildAllRecords()
  .slice()
  .sort((a, b) => b.min_bal_obshto - a.min_bal_obshto)

// Уникални училища за филтриране (по код, с името от първото срещане).
export const UNIQUE_SCHOOLS: ReadonlyArray<{
  code: string
  name: string
  count: number
}> = (() => {
  const map = new Map<string, { code: string; name: string; count: number }>()
  for (const r of ALL_RECORDS) {
    const existing = map.get(r.school_code)
    if (existing) {
      existing.count += 1
    } else {
      map.set(r.school_code, {
        code: r.school_code,
        name: r.school_name,
        count: 1,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'bg-BG'),
  )
})()

export function formatBal(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '')
}

export function formatGap(diff: number): string {
  const sign = diff >= 0 ? '+' : '−'
  return `${sign}${formatBal(Math.abs(diff))}`
}

/** Съкращава дълги имена на училища за компактно показване (напр. в таблици). */
export function shortSchoolName(name: string): string {
  // "Софийска математическа гимназия "Паисий Хилендарски"" -> "СМГ"
  // прости съкращения за най-разпознаваемите училища
  const abbreviations: Array<[RegExp, string]> = [
    [/^Софийска математическа гимназия/i, 'СМГ'],
    [/^Национална природо-математическа гимназия/i, 'НПМГ'],
    [/^Национална гимназия за древни езици и култури/i, 'НГДЕК'],
    [/^Технологично училище "Електронни системи"/i, 'ТУЕС'],
    [/^Национална финансово-стопанска гимназия/i, 'НФСГ'],
    [/^91\.НЕМСКА ЕЗИКОВА ГИМНАЗИЯ/i, '91. НЕГ'],
  ]
  for (const [re, abbr] of abbreviations) {
    if (re.test(name)) return abbr
  }
  return name
}
