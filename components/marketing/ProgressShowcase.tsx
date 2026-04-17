'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  'nvo-primer':  { label: 'НВО Примерен',  color: '#4f63d2' },
  'nvo-oficial': { label: 'НВО Официален', color: '#1e2d5a' },
  'dzi-primer':  { label: 'ДЗИ Примерен',  color: '#10b981' },
  'dzi-oficial': { label: 'ДЗИ Официален', color: '#f59e0b' },
}

interface LocalResult {
  id: string
  type: string
  subject: string
  score: number
  maxScore: number
  date: string
}

function getLocalResults(): LocalResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem('matura_results') || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function getLogins(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem('matura_logins') || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function pct(r: LocalResult): number {
  return r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0
}

function computeStreak(logins: string[]): number {
  if (!logins.length) return 0
  const sorted = [...logins].sort().reverse()
  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (const dateStr of sorted) {
    const d = new Date(dateStr)
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
    if (diff === 0 || diff === 1) { streak++; cursor = d } else break
  }
  return streak
}

function ScoreChart({ results }: { results: LocalResult[] }) {
  const W = 560, H = 200
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const allDates = [...new Set(results.map(r => r.date))].sort()

  const xScale = (date: string) => {
    const i = allDates.indexOf(date)
    return PAD.left + (allDates.length === 1 ? iW / 2 : (i / (allDates.length - 1)) * iW)
  }
  const yScale = (pct: number) => PAD.top + iH - (pct / 100) * iH

  const yTicks = [0, 25, 50, 75, 100]
  const categories = Object.keys(CATEGORY_META)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <h3 className="text-base font-bold mb-5" style={{ color: '#1e2a4a' }}>Резултати във времето</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
          {yTicks.map(t => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yScale(t)} y2={yScale(t)} stroke="#e5e7eb" strokeWidth={1} />
              <text x={PAD.left - 6} y={yScale(t) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{t}%</text>
            </g>
          ))}
          {allDates.map((d, i) => (
            (allDates.length <= 8 || i % Math.ceil(allDates.length / 8) === 0) && (
              <text key={d} x={xScale(d)} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">{d.slice(5)}</text>
            )
          ))}
          {categories.map(cat => {
            const pts = results.filter(r => r.type === cat).sort((a, b) => a.date.localeCompare(b.date))
            if (!pts.length) return null
            const pathD = pts.map((p, i) => {
              const x = xScale(p.date)
              const y = yScale(pct(p))
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')
            return (
              <g key={cat}>
                <path d={pathD} fill="none" stroke={CATEGORY_META[cat].color} strokeWidth={2} strokeLinejoin="round" />
                {pts.map(p => (
                  <circle
                    key={p.id}
                    cx={xScale(p.date)}
                    cy={yScale(pct(p))}
                    r={4}
                    fill={CATEGORY_META[cat].color}
                  />
                ))}
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {categories.filter(cat => results.some(r => r.type === cat)).map(cat => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: CATEGORY_META[cat].color }} />
            <span className="text-xs text-gray-500">{CATEGORY_META[cat].label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProgressShowcase() {
  const [results, setResults] = useState<LocalResult[]>([])
  const [logins, setLogins] = useState<string[]>([])

  useEffect(() => {
    setResults(getLocalResults())
    setLogins(getLogins())
  }, [])

  const avg = results.length
    ? Math.round(results.reduce((a, r) => a + pct(r), 0) / results.length)
    : null
  const best = results.length
    ? Math.max(...results.map(r => pct(r)))
    : null
  const streak = computeStreak(logins)

  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

  const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const stats = [
    { label: 'ЗАВЪРШЕНИ ТЕСТОВЕ',  value: results.length,                      sub: 'теста въведени' },
    { label: 'СРЕДНА ОЦЕНКА',      value: avg !== null ? `${avg}%` : '—',      sub: 'средно от всички' },
    { label: 'ПОРЕДНИ ДНИ',        value: streak,                               sub: 'дни активност' },
    { label: 'НАЙ-ВИСОК РЕЗУЛТАТ', value: best !== null ? `${best}%` : '—',    sub: 'от един тест' },
  ]

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: '#1e2a4a' }}>
            Виж напредъка си в реално време
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Всеки решен тест се записва. Виждаш ясно колко далеч си стигнал.
          </p>
        </div>

        {results.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-gray-100"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p className="text-base font-bold mb-1" style={{ color: '#1e2a4a' }}>Все още няма данни</p>
            <p className="text-sm text-gray-400 mb-6">Реши първия си тест и виж резултатите тук</p>
            <Link
              href="/register"
              className="text-white font-semibold px-8 py-3 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
              style={{ background: '#3b82f6' }}
            >
              Започни
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(c => (
                <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{c.label}</p>
                  <p className="text-3xl font-extrabold mb-1" style={{ color: '#1e2a4a' }}>{c.value}</p>
                  <p className="text-xs text-gray-400">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Weekly activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="text-base font-bold mb-5" style={{ color: '#1e2a4a' }}>Активност тази седмица</h3>
              <div className="flex gap-2 items-end">
                {weekDates.map((date, i) => {
                  const active = logins.includes(date)
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-full h-14 rounded-xl ${active ? 'bg-[#3b82f6]' : 'bg-gray-100'}`} />
                      <span className="text-[11px] text-gray-400">{weekDays[i]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Score chart */}
            <ScoreChart results={results} />

            {/* Results history — last 5 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold" style={{ color: '#1e2a4a' }}>История на резултатите</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {sorted.map(r => (
                  <li key={r.id} className="flex items-center gap-4 px-6 py-4">
                    <span className="text-2xl font-extrabold" style={{ color: '#1e2a4a' }}>
                      {pct(r)}%
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {CATEGORY_META[r.type]?.label ?? r.type} · {r.subject}
                      </p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
