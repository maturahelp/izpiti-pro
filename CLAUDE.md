## Git Pull Rule (MANDATORY)
Before making ANY changes to files in this repository — including the very first edit — run:
```
git pull origin main
```
This is non-negotiable. Do not skip it even for "small" changes. Do not assume the local copy is up to date.

Project Context
When working in this repository, prefer extending the existing exam platform over building disconnected prototypes. Preserve the current visual language, route structure, and Bulgarian UX copy unless a task explicitly asks for a redesign.
About This Project
izpiti-pro is a Next.js 15 + TypeScript + Tailwind CSS application for Bulgarian exam preparation.
It currently includes:

a public marketing site
a student dashboard
an admin area
data-driven NVO and DZI exam/test experiences

The app uses the App Router with route groups such as (marketing), (student), and (admin).
Tech Stack

Next.js 15
React 18
TypeScript with strict: true
Tailwind CSS
JSON/TS data files under data/

Common Commands
npm run dev      # starts Next.js on port 3335
npm run build    # production build
npm run lint     # lint the project
Notes:

The local dev server runs on http://localhost:3335.
There is no dedicated unit-test suite configured right now; lint and targeted manual verification are the main checks.

Key Directories
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
Architecture Notes

Use the App Router conventions already present in app/.
Most exam content is data-driven. Before inventing new structures, inspect the existing data files in data/.
Real exam rendering logic already exists in app/(student)/dashboard/tests/[id]/page.tsx. Reuse or extend that logic when adding new exam experiences.
The tests listing page lives in app/(student)/dashboard/tests/page.tsx and uses data/tests.ts as its catalog source.
Large official datasets are imported directly from JSON. Keep transformations explicit and localized so the original datasets remain understandable.
The project uses the @/* import alias from tsconfig.json.

UI And Styling Conventions

Preserve the existing typography and color system defined in app/layout.tsx and app/globals.css.
Prefer the shared utility classes and component patterns already used across the app:

.card
.card-hover
.input-field
.badge
.btn-primary
.btn-secondary


Keep mobile behavior first-class. Most student pages should work well on small screens without horizontal scrolling.
Preserve Bulgarian copy and ensure Cyrillic text renders correctly.

Exam Content Rules

NVO and DZI content should stay structurally faithful to real Bulgarian exam formats.
When adding mock exams, keep question numbering, source texts, charts/infographics, and answer key behavior internally consistent.
Prefer one canonical normalized source of truth for any new mock-exam data rather than duplicating similar payloads in multiple places.
If a chart or infographic is part of an exam, render it as UI, not as raw JSON.
If student answers are captured, persist them locally and make the state resilient across reloads.

Workflow Expectations
Before implementing:

Inspect the relevant route, components, and data files.
Identify whether the change belongs in marketing, student, admin, or shared infrastructure.
Reuse existing exam or dashboard patterns before introducing new abstractions.

When implementing:

Keep changes small and local where possible.
Prefer typed helpers over ad hoc inline data reshaping.
Normalize messy imported exam text close to the rendering/data boundary.
Avoid breaking existing dataset-driven pages.

Before finishing:

Run npm run lint when practical.
If UI changed, verify the affected route in the browser mentally or via local inspection for both desktop and mobile layout risks.
Call out any remaining content-quality limitations, especially around generated answer keys or mock exam wording.

Project-Specific Warnings

data/tests.ts contains both small practice tests and full official exam entries; do not assume every test has the same structure.
The exam detail page includes substantial normalization logic for imported official content. Read it before changing text/question rendering.
Public assets under public/context_images, public/dzi-context-images, public/question-images, and public/figures are part of the exam experience; avoid renaming or moving them casually.
This repo appears to rely heavily on static/local data rather than external APIs. Favor local data integration over adding backend complexity unless explicitly required.

Good Defaults For Claude

Ask whether a change should integrate into the existing student dashboard before creating a new standalone page.
Prefer updating existing components and data sources instead of creating parallel systems.
Optimize for clarity and maintainability over clever abstractions.
For content-heavy exam features, summarize the data model first, then implement.


Feature Preservation

The features below are intentionally implemented and must not be removed, simplified, or overwritten by future changes — even during refactors, merges, or conflict resolution. Before committing any change that touches the listed files, verify each relevant item is still present.

Critical files (handle with extra care):

app/(student)/dashboard/materials/page.tsx
  - Grade 12 DZI literature modal: two-column grid with LEFT column (text / summary / video / cover image ternary) and RIGHT column with four buttons: Текст, Резюме, Видео урок, Упражнение. Exercise button uses router.push('/dashboard/tests') — NOT a new tab.
  - Grade 7 NVO literature modal: same two-column grid with LEFT column (text / video / cover image ternary) and RIGHT column with three buttons: Текст, Видео урок, Упражнение. Exercise button uses router.push('/dashboard/literature-exercise/<id>') — NOT a new tab, NOT a Link with target="_blank".
  - Both modals use lazy video loading: isActiveWorkVideoPlaying / isActiveNvoVideoPlaying state. Video only plays after clicking the play overlay button; the poster image is shown until then.
  - The reading marker feature (isNvoReadingMarkerEnabled, handleNvoWordMark, nvoWordRefs) must remain in the grade 7 text panel.

data/literatureSummaries.ts
  - Contains detailed multi-paragraph analyses with section headings (ТВОРЧЕСКА ИСТОРИЯ, ЗАГЛАВИЕ, СЮЖЕТНИ И КОМПОЗИЦИОННИ ОСОБЕНОСТИ, КОМПОЗИЦИЯ, ТЕМИ, КОНФЛИКТИ И ПОСЛАНИЯ). Do NOT replace with short bullet-point summaries.

app/(student)/dashboard/tests/page.tsx
  - Grade 7 filter: BEL / Математика subject buttons + Примерен НВО / НВО от минали години mode toggle.
  - Grade 12 filter: БЕЛ / Английски subject buttons + Примерен ДЗИ / ДЗИ от минали години mode toggle.
  - When grade === '12' && selectedSection12 === 'english' && selectedMode === 'sample': shows Reading Comprehension Bank and Writing Prompts Bank cards (not a regular test list).
  - getTestMode classifies tests as 'sample' or 'past' based on ID prefix. getTestHref handles english-generated- prefix separately.

data/tests.ts
  - Imports: mockTests from './mock-tests' and englishTests from './english-tests'. Both are spread exactly once into the allTests array. Do NOT add duplicate spreads.

data/english-tests.ts
  - Imports officialEnglishMockExams from '../lib/official-english-mock-data' and generated materials from '../lib/english-generated-materials'. Both are used. Do not remove either.

Pre-commit feature check (run mentally or with grep before every push):
  1. npm run build — must pass with zero errors.
  2. Grep for 'target="_blank"' in materials/page.tsx — must not appear in the NVO or DZI exercise buttons.
  3. Grep for 'isActiveWorkVideoPlaying\|isActiveNvoVideoPlaying' in materials/page.tsx — must still exist.
  4. Grep for 'ТВОРЧЕСКА ИСТОРИЯ' in data/literatureSummaries.ts — must still exist.
  5. Grep for 'englishTests' in data/tests.ts — must appear exactly once as a spread.

Merge and conflict resolution rules:
  - For data files (tests.ts, english-tests.ts, literatureSummaries.ts, literatureWorks.ts, materials.ts): always keep ALL entries from BOTH sides of the conflict. Never discard data to resolve a conflict.
  - For the materials page and tests page: read both sides of a conflict carefully. The side with more features (more buttons, more panels, lazy-load logic) is almost always the correct one to keep. Never use git checkout --ours or --theirs blindly on these files.
  - After any merge or cherry-pick, run the pre-commit feature check above before pushing.

Git Safety Protocol

These rules protect the repository history. Follow them without exception.

Before any git operation, always run first:
bashgit status
git log --oneline -15
Never commit directly to main. Always use a feature branch:
bashgit checkout -b fix/exercise-boxes
# or
git checkout -b feat/dzi-progress-chart
Commit frequently with descriptive messages:
bash# Commit one logical change at a time
git add -p   # review exactly what you are staging
git commit -m "fix(dashboard): make exercise cards equal height with CSS grid"

# Format: type(scope): description
# Types: feat, fix, style, refactor, chore, docs
Mandatory pre-push checklist — run all of these, stop if anything fails:
bash# 1. Confirm you are NOT on main
git branch --show-current

# 2. Review every file changed since branching
git diff main...HEAD --stat

# 3. Check for accidentally deleted files — STOP and report to user if any appear
git diff main...HEAD --name-status | grep "^D"

# 4. Confirm the build passes
npm run build 2>&1 | tail -20

# 5. Confirm no lint errors
npm run lint 2>&1 | tail -20
Pushing:
bash# Push the feature branch only
git push origin fix/exercise-boxes
After pushing, stop and report to the user:
✅ Branch `fix/exercise-boxes` pushed.
Changed: X files modified, Y files added, Z files deleted.
Please review on GitHub and merge when ready.
Do NOT merge into main automatically. Wait for explicit instruction from the user.
Absolutely forbidden git commands:
bashgit push --force        # forbidden — rewrites shared history
git push -f             # forbidden
git reset --hard        # forbidden without explicit user instruction
git clean -fd           # forbidden without explicit user instruction
git rebase main         # forbidden on shared branches
Never commit these files:

.env.local, .env, or any file containing real secrets or API keys
node_modules/
.next/
Any file not already tracked unless it is intentionally new

Session end — always output this summary before finishing:
## Session Summary

Files modified:
- [file path] — [one-line description of change]

Files created:
- [file path] — [one-line description]

Files deleted:
- [file path] — CONFIRM with user before deleting anything

Git status:
- Branch: [name]
- Commits made: [count]
- Pushed: yes / no

Remaining work:
- [anything not completed or that needs manual review]
