# Project Context

When working in this repository, prefer extending the existing exam platform over building disconnected prototypes. Preserve the current visual language, route structure, and Bulgarian UX copy unless a task explicitly asks for a redesign.

## About This Project

`izpiti-pro` is a Next.js 15 + TypeScript + Tailwind CSS application for Bulgarian exam preparation.

It currently includes:
- a public marketing site
- a student dashboard
- an admin area
- data-driven NVO and DZI exam/test experiences

The app uses the App Router with route groups such as `(marketing)`, `(student)`, and `(admin)`.

## Tech Stack

- Next.js 15
- React 18
- TypeScript with `strict: true`
- Tailwind CSS
- JSON/TS data files under `data/`

## Common Commands

```bash
npm run dev      # starts Next.js on port 3335
npm run build    # production build
npm run lint     # lint the project
```

Notes:
- The local dev server runs on `http://localhost:3335`.
- There is no dedicated unit-test suite configured right now; `lint` and targeted manual verification are the main checks.

## Key Directories

```text
app/
  (marketing)/           public landing pages
  (student)/dashboard/   student product experience
  (admin)/admin/         admin tools and management pages
components/
  dashboard/             student dashboard UI
  marketing/             landing page sections
  shared/                reusable UI primitives
  admin/                 admin navigation
data/
  tests.ts               test catalog metadata shown in the UI
  subjects.ts            subject metadata
  lessons.ts             lesson metadata
  materials.ts           study material metadata
  official_quiz_dataset.json
  official_dzi_bel_dataset.json
  nvo-*.ts               NVO-specific helpers, overrides, and assets
public/
  context_images/        NVO BEL context images
  dzi-context-images/    DZI BEL context images
  question-images/       math question assets
  figures/               geometry/helper SVGs
lib/
  utils.ts               shared helpers such as class merging and styling helpers
```

## Architecture Notes

- Use the App Router conventions already present in `app/`.
- Most exam content is data-driven. Before inventing new structures, inspect the existing data files in `data/`.
- Real exam rendering logic already exists in [`app/(student)/dashboard/tests/[id]/page.tsx`](/Users/danielmladenov/Claude/nvo_pdfs/izpiti-pro/app/(student)/dashboard/tests/[id]/page.tsx). Reuse or extend that logic when adding new exam experiences.
- The tests listing page lives in [`app/(student)/dashboard/tests/page.tsx`](/Users/danielmladenov/Claude/nvo_pdfs/izpiti-pro/app/(student)/dashboard/tests/page.tsx) and uses `data/tests.ts` as its catalog source.
- Large official datasets are imported directly from JSON. Keep transformations explicit and localized so the original datasets remain understandable.
- The project uses the `@/*` import alias from `tsconfig.json`.

## UI And Styling Conventions

- Preserve the existing typography and color system defined in [`app/layout.tsx`](/Users/danielmladenov/Claude/nvo_pdfs/izpiti-pro/app/layout.tsx) and [`app/globals.css`](/Users/danielmladenov/Claude/nvo_pdfs/izpiti-pro/app/globals.css).
- Prefer the shared utility classes and component patterns already used across the app:
  - `.card`
  - `.card-hover`
  - `.input-field`
  - `.badge`
  - `.btn-primary`
  - `.btn-secondary`
- Keep mobile behavior first-class. Most student pages should work well on small screens without horizontal scrolling.
- Preserve Bulgarian copy and ensure Cyrillic text renders correctly.

## Exam Content Rules

- NVO and DZI content should stay structurally faithful to real Bulgarian exam formats.
- When adding mock exams, keep question numbering, source texts, charts/infographics, and answer key behavior internally consistent.
- Prefer one canonical normalized source of truth for any new mock-exam data rather than duplicating similar payloads in multiple places.
- If a chart or infographic is part of an exam, render it as UI, not as raw JSON.
- If student answers are captured, persist them locally and make the state resilient across reloads.

## Workflow Expectations

Before implementing:
1. Inspect the relevant route, components, and data files.
2. Identify whether the change belongs in marketing, student, admin, or shared infrastructure.
3. Reuse existing exam or dashboard patterns before introducing new abstractions.

When implementing:
1. Keep changes small and local where possible.
2. Prefer typed helpers over ad hoc inline data reshaping.
3. Normalize messy imported exam text close to the rendering/data boundary.
4. Avoid breaking existing dataset-driven pages.

Before finishing:
1. Run `npm run lint` when practical.
2. If UI changed, verify the affected route in the browser mentally or via local inspection for both desktop and mobile layout risks.
3. Call out any remaining content-quality limitations, especially around generated answer keys or mock exam wording.

## Project-Specific Warnings

- `data/tests.ts` contains both small practice tests and full official exam entries; do not assume every test has the same structure.
- The exam detail page includes substantial normalization logic for imported official content. Read it before changing text/question rendering.
- Public assets under `public/context_images`, `public/dzi-context-images`, `public/question-images`, and `public/figures` are part of the exam experience; avoid renaming or moving them casually.
- This repo appears to rely heavily on static/local data rather than external APIs. Favor local data integration over adding backend complexity unless explicitly required.

## Good Defaults For Claude

- Ask whether a change should integrate into the existing student dashboard before creating a new standalone page.
- Prefer updating existing components and data sources instead of creating parallel systems.
- Optimize for clarity and maintainability over clever abstractions.
- For content-heavy exam features, summarize the data model first, then implement.
