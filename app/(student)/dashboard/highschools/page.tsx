'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'
import sofiaData from '@/data/sofiaHighSchools2025.json'

type Profile = {
  school_code: string | null
  school_name: string | null
  profile_code: string | null
  profile_name: string
  min_total: number | null
  min_men: number | null
  min_women: number | null
  max_total: number | null
  max_men: number | null
  max_women: number | null
}

type Dataset = {
  source: string
  source_date: string
  source_url: string
  profiles: Profile[]
}

const dataset = sofiaData as Dataset

type ProfileCategory =
  | 'math'
  | 'natural-science'
  | 'language'
  | 'humanities'
  | 'arts'
  | 'sports'
  | 'it'
  | 'vocational'
  | 'general'

const CATEGORY_LABELS: Record<ProfileCategory, string> = {
  math: 'Математически',
  'natural-science': 'Природоматематически',
  language: 'Чуждоезиков',
  humanities: 'Хуманитарен',
  arts: 'Изкуства',
  sports: 'Спорт',
  it: 'Софтуер / ИТ',
  vocational: 'Професионален',
  general: 'Общообразователен',
}

const CATEGORIES: ProfileCategory[] = [
  'math',
  'natural-science',
  'language',
  'humanities',
  'arts',
  'sports',
  'it',
  'vocational',
  'general',
]

function categorize(p: Profile): ProfileCategory {
  const text = `${p.profile_name} ${p.school_name ?? ''}`.toLowerCase()
  if (/информатик|софтуер|програмир|компютърн|кибер|it /.test(text)) return 'it'
  if (/математ/.test(text)) {
    if (/природ|физик|биолог|хим/.test(text)) return 'natural-science'
    return 'math'
  }
  if (/природ|физик|биолог|хим|еколо/.test(text)) return 'natural-science'
  if (/чужд|езиков|англий|немск|френск|испанск|италианск|руск|японск|китай|португал/.test(text))
    return 'language'
  if (/хуманитар|истори|философ|психолог|обществен/.test(text)) return 'humanities'
  if (/изкуств|музика|танц|худож|графич|дизай|архитектур|театр|кино|акт[ьъе]рск/.test(text))
    return 'arts'
  if (/спорт|туриз[ьъ]м|физическ/.test(text)) return 'sports'
  if (/професионал|техническ|механ|електр|транспорт|строител|дуалн|готвар|сервитьор|кулинар|шивач|туроперат|икономи|администрат|туризъм/.test(text))
    return 'vocational'
  return 'general'
}

function formatScore(value: number | null | undefined): string {
  if (value == null || value === 0) return '—'
  // round to 2dp but trim trailing zeros
  return String(Math.round(value * 100) / 100)
}

type SortKey = 'school' | 'min' | 'max'

export default function HighSchoolsPage() {
  const enriched = useMemo(
    () => dataset.profiles.map((p) => ({ ...p, category: categorize(p) })),
    []
  )

  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<ProfileCategory>>(new Set())
  const [minScoreInput, setMinScoreInput] = useState('')
  const [hideUnfilled, setHideUnfilled] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('min')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const minScoreFilter = (() => {
    const n = Number(minScoreInput.replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : null
  })()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = enriched.filter((p) => {
      if (hideUnfilled && (p.min_total ?? 0) === 0 && (p.max_total ?? 0) === 0) return false
      if (selectedCategories.size > 0 && !selectedCategories.has(p.category)) return false
      if (minScoreFilter != null && (p.min_total ?? 0) > minScoreFilter) return false
      if (q) {
        const hay = `${p.school_name ?? ''} ${p.profile_name}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    const dir = sortDir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      if (sortKey === 'school') {
        return dir * ((a.school_name ?? '').localeCompare(b.school_name ?? '', 'bg'))
      }
      const av = sortKey === 'min' ? a.min_total ?? 0 : a.max_total ?? 0
      const bv = sortKey === 'min' ? b.min_total ?? 0 : b.max_total ?? 0
      return dir * (av - bv)
    })

    return list
  }, [enriched, query, selectedCategories, minScoreFilter, hideUnfilled, sortKey, sortDir])

  const toggleCategory = (c: ProfileCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  const stats = useMemo(() => {
    const withScores = enriched.filter((p) => (p.min_total ?? 0) > 0)
    return {
      schools: new Set(enriched.map((p) => p.school_name)).size,
      profiles: enriched.length,
      filled: withScores.length,
      maxMin: Math.max(...withScores.map((p) => p.min_total ?? 0)),
    }
  }, [enriched])

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Бал гимназии" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
            Безплатен справочник
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A4A]">
            Бал на гимназиите в София — 2025 г.
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Минимален и максимален бал на приетите второ класиране, по паралелки. Виж къде си спрямо
            миналогодишните прагове, за да си поставиш реалистична цел за матурата.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Училища" value={stats.schools.toString()} />
          <StatCard label="Паралелки" value={stats.profiles.toString()} />
          <StatCard label="С приети ученици" value={stats.filled.toString()} />
          <StatCard label="Най-висок мин. бал" value={formatScore(stats.maxMin)} />
        </div>

        {/* Search + filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 mb-4">
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 mb-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търси по име на училище или специалност…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500"
            />
            <input
              type="text"
              inputMode="decimal"
              value={minScoreInput}
              onChange={(e) => setMinScoreInput(e.target.value)}
              placeholder="Моят бал (напр. 380)"
              className="w-full sm:w-44 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500"
            />
            <label className="flex items-center gap-2 text-xs text-gray-600 sm:px-2">
              <input
                type="checkbox"
                checked={hideUnfilled}
                onChange={(e) => setHideUnfilled(e.target.checked)}
                className="h-4 w-4 accent-[#3b82f6]"
              />
              Скрий незапълнените
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selectedCategories.has(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-[#1E2A4A] text-white border-[#1E2A4A]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              )
            })}
            {selectedCategories.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategories(new Set())}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-red-600 hover:underline"
              >
                Изчисти филтрите
              </button>
            )}
          </div>
        </div>

        {/* Result note */}
        <p className="text-xs text-gray-500 mb-3">
          Намерени: <strong className="text-gray-900">{filtered.length}</strong> паралелки
          {minScoreFilter != null && (
            <>
              {' '}— показани са тези, в които при бал <strong>{formatScore(minScoreFilter)}</strong>{' '}
              би бил приет.
            </>
          )}
        </p>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <Th
                    label="Училище"
                    sortable
                    active={sortKey === 'school'}
                    direction={sortKey === 'school' ? sortDir : null}
                    onClick={() => {
                      if (sortKey === 'school') {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortKey('school')
                        setSortDir('asc')
                      }
                    }}
                  />
                  <th className="px-3 py-3 text-left font-semibold">Паралелка</th>
                  <th className="px-3 py-3 text-left font-semibold">Категория</th>
                  <Th
                    label="Мин."
                    align="right"
                    sortable
                    active={sortKey === 'min'}
                    direction={sortKey === 'min' ? sortDir : null}
                    onClick={() => {
                      if (sortKey === 'min') {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortKey('min')
                        setSortDir('desc')
                      }
                    }}
                  />
                  <Th
                    label="Макс."
                    align="right"
                    sortable
                    active={sortKey === 'max'}
                    direction={sortKey === 'max' ? sortDir : null}
                    onClick={() => {
                      if (sortKey === 'max') {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortKey('max')
                        setSortDir('desc')
                      }
                    }}
                  />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-12 text-sm">
                      Няма съвпадения. Промени филтрите или търсенето.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => {
                    const isReachable =
                      minScoreFilter != null && (p.min_total ?? 0) > 0 && minScoreFilter >= (p.min_total ?? 0)
                    return (
                      <tr
                        key={`${p.school_code}-${p.profile_code}-${idx}`}
                        className={`border-t border-gray-100 ${
                          isReachable ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <td className="px-3 py-3 align-top">
                          <div className="font-medium text-[#1E2A4A] leading-tight">
                            {p.school_name ?? '—'}
                          </div>
                          {p.school_code && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Код {p.school_code}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top text-gray-700">{p.profile_name}</td>
                        <td className="px-3 py-3 align-top">
                          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {CATEGORY_LABELS[p.category]}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top text-right font-semibold text-[#1E2A4A] tabular-nums">
                          {formatScore(p.min_total)}
                        </td>
                        <td className="px-3 py-3 align-top text-right text-gray-600 tabular-nums">
                          {formatScore(p.max_total)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            Данни: {dataset.source} ({dataset.source_date}). Източник:{' '}
            <Link
              href={dataset.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              danybon.com
            </Link>
            .
          </p>
          <Link href="/dashboard/materials" className="text-primary-600 hover:underline">
            ← Към материалите
          </Link>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold text-[#1E2A4A] mt-1 tabular-nums">{value}</p>
    </div>
  )
}

function Th({
  label,
  align = 'left',
  sortable,
  active,
  direction,
  onClick,
}: {
  label: string
  align?: 'left' | 'right'
  sortable?: boolean
  active?: boolean
  direction?: 'asc' | 'desc' | null
  onClick?: () => void
}) {
  return (
    <th
      className={`px-3 py-3 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={onClick}
      role={sortable ? 'button' : undefined}
      style={sortable ? { cursor: 'pointer' } : undefined}
    >
      <span className={active ? 'text-[#1E2A4A]' : ''}>
        {label}
        {sortable && active && direction && (
          <span className="ml-1">{direction === 'asc' ? '▲' : '▼'}</span>
        )}
      </span>
    </th>
  )
}
