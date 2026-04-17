'use client'

import { useEffect, useRef, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { fetchProgressData, type ExamCategory } from '@/lib/progress'

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
  return JSON.parse(localStorage.getItem('matura_results') || '[]')
}

function saveLocalResults(results: LocalResult[]) {
  localStorage.setItem('matura_results', JSON.stringify(results))
}

function getLogins(): string[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('matura_logins') || '[]')
}

function recordTodayLogin() {
  const today = new Date().toISOString().slice(0, 10)
  const logins = getLogins()
  if (!logins.includes(today)) {
    logins.push(today)
    localStorage.setItem('matura_logins', JSON.stringify(logins))
  }
}

function computeStreak(logins: string[]) {
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

// SVG multi-line chart — replicates mock's Chart.js layout
function ScoreChart({ results }: { results: LocalResult[] }) {
  const W = 560, H = 200
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const allDates = [...new Set(results.map(r => r.date))].sort()
  if (!allDates.length) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-400 py-12">
      Все още няма въведени резултати. Добави първия си тест, за да видиш графиката.
    </div>
  )

  const xScale = (date: string) => {
    const i = allDates.indexOf(date)
    return PAD.left + (allDates.length === 1 ? iW / 2 : (i / (allDates.length - 1)) * iW)
  }
  const yScale = (pct: number) => PAD.top + iH - (pct / 100) * iH

  const yTicks = [0, 25, 50, 75, 100]
  const categories = Object.keys(CATEGORY_META)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-[#1e2d5a] mb-5">Резултати във времето</h3>
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
              const y = yScale(Math.round((p.score / p.maxScore) * 100))
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')
            return (
              <g key={cat}>
                <path d={pathD} fill="none" stroke={CATEGORY_META[cat].color} strokeWidth={2} strokeLinejoin="round" />
                {pts.map(p => (
                  <circle
                    key={p.id}
                    cx={xScale(p.date)}
                    cy={yScale(Math.round((p.score / p.maxScore) * 100))}
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

export default function ProgressPage() {
  const [results, setResults] = useState<LocalResult[]>([])
  const [logins, setLogins] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    recordTodayLogin()
    setResults(getLocalResults())
    setLogins(getLogins())
  }, [])

  function refresh() {
    setResults(getLocalResults())
    setLogins(getLogins())
  }

  function deleteResult(id: string) {
    saveLocalResults(getLocalResults().filter(r => r.id !== id))
    refresh()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const entry: LocalResult = {
      id: Date.now().toString(),
      type: fd.get('type') as string,
      subject: fd.get('subject') as string,
      score: Number(fd.get('score')),
      maxScore: Number(fd.get('maxScore')),
      date: fd.get('date') as string,
    }
    const all = getLocalResults()
    all.push(entry)
    saveLocalResults(all)
    setModalOpen(false)
    refresh()
  }

  const avg = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score / r.maxScore) * 100, 0) / results.length)
    : null
  const best = results.length
    ? Math.max(...results.map(r => Math.round((r.score / r.maxScore) * 100)))
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

  const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date))

  const stats = [
    { label: 'ЗАВЪРШЕНИ ТЕСТОВЕ',  value: results.length,               sub: 'теста въведени' },
    { label: 'СРЕДНА ОЦЕНКА',      value: avg !== null ? `${avg}%` : '—', sub: 'средно от всички' },
    { label: 'ПОРЕДНИ ДНИ',        value: streak,                         sub: 'дни активност' },
    { label: 'НАЙ-ВИСОК РЕЗУЛТАТ', value: best !== null ? `${best}%` : '—', sub: 'от един тест' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-gray-50">
      <TopBar title="Напредък" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1e2d5a]">Моят напредък</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#4f63d2] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-indigo-700 transition"
          >
            + Добави резултат
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{c.label}</p>
              <p className="text-3xl font-extrabold text-[#1e2d5a] mb-1">{c.value}</p>
              <p className="text-xs text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Weekly activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-[#1e2d5a] mb-5">Активност тази седмица</h3>
          <div className="flex gap-2 items-end">
            {weekDates.map((date, i) => {
              const active = logins.includes(date)
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full h-14 rounded-xl ${active ? 'bg-[#4f63d2]' : 'bg-gray-100'}`} />
                  <span className="text-[11px] text-gray-400">{weekDays[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Score chart */}
        <ScoreChart results={results} />

        {/* Results history */}
        {sorted.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1e2d5a]">История на резултатите</h3>
            </div>
            <ul className="divide-y divide-gray-50">
              {sorted.map(r => (
                <li key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-extrabold text-[#1e2d5a]">
                      {Math.round((r.score / r.maxScore) * 100)}%
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {CATEGORY_META[r.type]?.label ?? r.type} · {r.subject}
                      </p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteResult(r.id)}
                    className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                  >✕</button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-400 py-10">
            Все още няма активност. Добави първия си резултат, за да видиш прогреса си тук.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-[#1e2d5a] mb-6">Добави резултат</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Вид тест</label>
                <select name="type" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="nvo-primer">НВО — Примерен</option>
                  <option value="nvo-oficial">НВО — Официален</option>
                  <option value="dzi-primer">ДЗИ — Примерен</option>
                  <option value="dzi-oficial">ДЗИ — Официален</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Предмет</label>
                <select name="subject" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="БЕЛ">БЕЛ</option>
                  <option value="МАТ">МАТ</option>
                  <option value="Друго">Друго</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Точки</label>
                  <input name="score" type="number" min="0" required placeholder="72"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">От максимум</label>
                  <input name="maxScore" type="number" min="1" required placeholder="100"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Дата</label>
                <input name="date" type="date" required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-full text-sm hover:bg-gray-50 transition">
                  Откажи
                </button>
                <button type="submit"
                  className="flex-1 bg-[#4f63d2] text-white font-semibold py-2.5 rounded-full text-sm hover:bg-indigo-700 transition">
                  Запази
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
