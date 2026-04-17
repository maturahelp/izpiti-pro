# Progress Showcase Landing Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `Features` marketing section with a `ProgressShowcase` section that reads real `localStorage` progress data and renders it in landing-page visual style, with an empty-state CTA when no data exists.

**Architecture:** Single new `'use client'` component `components/marketing/ProgressShowcase.tsx` containing all data logic, a `ScoreChart` SVG sub-component, and four content blocks. `app/(marketing)/page.tsx` swaps the `Features` import for `ProgressShowcase`. No shared components are extracted — the landing page stays self-contained.

**Tech Stack:** Next.js 15, React 18, TypeScript strict, Tailwind CSS, inline SVG for chart.

---

## Files

| Action | File |
|---|---|
| Create | `components/marketing/ProgressShowcase.tsx` |
| Modify | `app/(marketing)/page.tsx` — swap Features import/usage |

---

### Task 1: Create `ProgressShowcase.tsx`

**Files:**
- Create: `components/marketing/ProgressShowcase.tsx`

- [ ] **Step 1: Create the file with complete implementation**

Write the entire file as shown below. This is the complete, final implementation.

```tsx
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
  return JSON.parse(localStorage.getItem('matura_results') || '[]')
}

function getLogins(): string[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('matura_logins') || '[]')
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

export function ProgressShowcase() {
  const [results, setResults] = useState<LocalResult[]>([])
  const [logins, setLogins] = useState<string[]>([])

  useEffect(() => {
    setResults(getLocalResults())
    setLogins(getLogins())
  }, [])

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
                      {Math.round((r.score / r.maxScore) * 100)}%
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
```

- [ ] **Step 2: Verify the file was created**

```bash
ls components/marketing/ProgressShowcase.tsx
```

Expected: file listed with no error.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds, no TypeScript errors. If errors appear, fix them before proceeding.

- [ ] **Step 4: Commit**

```bash
git add components/marketing/ProgressShowcase.tsx
git commit -m "feat: add ProgressShowcase marketing section with real localStorage data"
```

---

### Task 2: Wire into the marketing page

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Update the page assembly**

Replace the contents of `app/(marketing)/page.tsx` with:

```tsx
import { Header } from '@/components/marketing/Header'
import { Hero } from '@/components/marketing/Hero'
import { Benefits } from '@/components/marketing/Benefits'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ProgressShowcase } from '@/components/marketing/ProgressShowcase'
import { ExamsSection } from '@/components/marketing/ExamsSection'
import { ForWhom } from '@/components/marketing/ForWhom'
import { Testimonials } from '@/components/marketing/Testimonials'
import { Pricing } from '@/components/marketing/Pricing'
import { FAQ } from '@/components/marketing/FAQ'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <ProgressShowcase />
        <ExamsSection />
        <ForWhom />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds with all routes listed. The `/` route should appear as `ƒ` (dynamic) because `ProgressShowcase` is a client component that reads localStorage.

- [ ] **Step 3: Manual verification**

Start the dev server and open `http://localhost:3335`:

```bash
npm run dev
```

**With no data:** The section between HowItWorks and ExamsSection should show the empty state (chart icon, "Все още няма данни", "Започни" button linking to `/register`).

**With data:** Open DevTools → Application → Local Storage → set `matura_results` to:
```json
[{"id":"1","type":"nvo-primer","subject":"БЕЛ","score":72,"maxScore":100,"date":"2026-04-15"},{"id":"2","type":"dzi-primer","subject":"МАТ","score":85,"maxScore":100,"date":"2026-04-16"}]
```
Reload. The section should show: 2 stat cards populated, weekly bars, a line chart with two colored lines, and 2 history rows.

- [ ] **Step 4: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: replace Features with ProgressShowcase in marketing page"
```
