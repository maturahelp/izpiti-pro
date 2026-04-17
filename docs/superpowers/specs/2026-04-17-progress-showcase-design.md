# Progress Showcase Landing Section

**Date:** 2026-04-17  
**Repo:** izpiti-pro (Next.js 15 + Tailwind CSS)

---

## Goal

Replace the existing `Features.tsx` marketing component with a new `ProgressShowcase.tsx` section that renders the student's real progress data (from `localStorage`) in landing-page visual style. Visitors who have used the app see their live stats; visitors with no data see an empty state CTA.

---

## Architecture

Single new component file. No shared component extraction — the data logic is copied directly from `app/(student)/dashboard/progress/page.tsx` into the marketing component. This keeps the landing page self-contained.

**File changed:**
- Create: `components/marketing/ProgressShowcase.tsx`
- Modify: `app/(marketing)/page.tsx` — swap `<Features />` import and usage for `<ProgressShowcase />`
- Delete: `components/marketing/Features.tsx` is no longer used (can be left or removed)

---

## Component: `ProgressShowcase.tsx`

### Directive
`'use client'` — required for `localStorage` and `useState`/`useEffect`.

### Data
Reads two `localStorage` keys on mount (same keys as the progress dashboard):
- `matura_results` → `LocalResult[]` (id, type, subject, score, maxScore, date)
- `matura_logins` → `string[]` (ISO date strings)

Computes on the client:
- `avg` — average `(score/maxScore)*100` across all results, rounded to 1 decimal, or `null`
- `best` — max single-test percentage, or `null`
- `streak` — consecutive login days ending today (same algorithm as progress page)
- `weekDates` — ISO dates for Mon–Sun of current week
- `sorted` — results sorted descending by date, capped at last 5 for display

### Empty state (no `matura_results` or empty array)
Centered card inside the section:
- Chart/bar icon (inline SVG)
- Heading: "Все още няма данни"
- Body: "Реши първия си тест и виж резултатите тук"
- CTA button: "Започни" → `/register` (blue `rounded-full`, matches landing style)

### Data state layout (full-width, landing page styled)
Section background: white. Max width `max-w-5xl mx-auto px-6`. Section padding `py-16 md:py-20`.

**Section header** (centered):
- `h2`: "Виж напредъка си в реално време" — `text-3xl md:text-4xl font-extrabold` `#1e2a4a`
- Subheading: "Всеки решен тест се записва. Виждаш ясно колко далеч си стигнал." — `text-gray-500 text-sm md:text-base`

**Block 1 — Stat cards** (`grid grid-cols-2 md:grid-cols-4 gap-4`):

| Label | Value |
|---|---|
| ЗАВЪРШЕНИ ТЕСТОВЕ | `results.length` |
| СРЕДНА ОЦЕНКА | `avg !== null ? \`${avg}%\` : '—'` |
| ПОРЕДНИ ДНИ | `streak` |
| НАЙ-ВИСОК РЕЗУЛТАТ | `best !== null ? \`${best}%\` : '—'` |

Card style: `bg-white rounded-2xl shadow-sm p-5`, label `text-[10px] font-bold text-gray-400 uppercase tracking-widest`, value `text-3xl font-extrabold text-[#1e2a4a]`, sub `text-xs text-gray-400`.

**Block 2 — Weekly activity** (`bg-white rounded-2xl shadow-sm p-6`):
- Heading: "Активност тази седмица"
- 7 bars (Пн–Нд): active day → `bg-[#3b82f6]`, inactive → `bg-gray-100`, height `h-14`, `rounded-xl`

**Block 3 — SVG score line chart** (`bg-white rounded-2xl shadow-sm p-6`):
- Heading: "Резултати във времето"
- Same SVG multi-line chart as progress page: viewBox `0 0 560 200`, y-axis 0/25/50/75/100%, x-axis dates, one polyline per category (НВО Примерен `#4f63d2`, НВО Официален `#1e2d5a`, ДЗИ Примерен `#10b981`, ДЗИ Официален `#f59e0b`)
- Dot at each data point, same style

**Block 4 — Results history** (`bg-white rounded-2xl shadow-sm overflow-hidden`):
- Heading row: "История на резултатите"
- Last 5 results, each row: score% (bold navy) + type · subject (sm gray) + date (xs gray-400)
- No delete button (read-only in landing context)

### Styling tokens (matches landing page)
- Card shadow: `0 4px 20px rgba(0,0,0,0.06)` (or Tailwind `shadow-sm`)
- Primary blue: `#3b82f6`
- Navy: `#1e2a4a`
- Rounded: `rounded-2xl`
- CTA button: `bg-[#3b82f6] text-white rounded-full px-8 py-3 font-semibold text-sm hover:shadow-lg hover:shadow-blue-200`

---

## Page Assembly Change

`app/(marketing)/page.tsx`:
- Remove `import { Features } from '@/components/marketing/Features'`
- Add `import { ProgressShowcase } from '@/components/marketing/ProgressShowcase'`
- Replace `<Features />` with `<ProgressShowcase />`
- Section order becomes: Hero → Benefits → HowItWorks → **ProgressShowcase** → ExamsSection → ForWhom → Testimonials → Pricing → FAQ

---

## No changes to
- Any dashboard component or data file
- Any other marketing component
- `globals.css` or `tailwind.config.ts`
