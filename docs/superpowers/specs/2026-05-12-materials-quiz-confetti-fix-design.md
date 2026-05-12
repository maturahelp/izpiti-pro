# Materials quiz confetti — root cause and fix

**Date:** 2026-05-12
**Branch:** `fix/remove-nvo-dzi-pages-and-confetti`
**Status:** Pushed, awaiting PR review

## Symptom

When a student selects the correct answer in a materials quiz on production (`www.maturahelp.com`) and clicks "Провери", **absolutely nothing** happens visually — no confetti, no animation. The same canvas-confetti library renders correctly on `/brochure?page=5` (verified in Screen Recording 2026-05-11 at 23.06.55).

Affected pages:
- `/dashboard/materials/curriculum-topic/[id]?view=exercise`
- `/dashboard/materials/rule/[id]`
- `/dashboard/materials/math-7-topics`
- `/dashboard/literature-exercise/[workId]`

All four call `fireConfetti()` from `lib/confetti.ts` when `selectedAnswer === correctAnswer`.

## Root cause

`lib/confetti.ts` (pre-fix) did two unsafe things together:

```ts
// no 'use client' directive
export function fireConfetti(): void {
  import('canvas-confetti').then((mod) => {
    mod.default({ /* options */ })
  })
}
```

1. **No `'use client'` directive on the helper.** The materials quiz pages are client components (`'use client'`), but the helper module is treated by Turbopack as a regular module. When a client component imports it, the helper code is bundled, but the dynamic `import('canvas-confetti')` inside it relies on a module ID that needs to be registered in the **client** module graph. Without the directive, Turbopack registers it in the server graph; on the client the runtime call returns a module shape that is not the expected default-export, so `mod.default` is undefined-or-wrong.
2. **No `.catch` on the promise.** Whatever goes wrong inside the dynamic import resolves to a silent failure — the user sees no confetti and no console error draws attention to it.

The brochure (`components/marketing/BrochurePage.tsx`) escapes the bug because its `await import('canvas-confetti')` lives **directly inside a `'use client'` component**, so Turbopack registers the canvas-confetti module ID in the client graph correctly. That's why the brochure burst works on the same production build where the materials quizzes don't.

### Supporting evidence

| Evidence | What it tells us |
| --- | --- |
| User reports "absolutely nothing" | Promise resolves to wrong shape or rejects; no `.catch` means the error is invisible |
| Brochure works on the exact same prod deployment | canvas-confetti is reachable as a chunk (`12pn601qlkdkw.js`, HTTP 200, ~10KB), so it's not a 404 |
| Many prior unmerged "fix" commits on `feat/restore-confetti-effects` (e.g. `9dc9c6f7 fix(quizzes): inline canvas-confetti directly in click handlers — Removes utility-function indirection that may not have bundled correctly`) | Previous attempts already suspected the helper file. They were on the right track but never merged. |
| `head -1 lib/confetti.ts` had no `'use client'` line | Direct cause of Turbopack mis-graphing the dynamic import |
| The materials quizzes are inside the `(student)` route group with auth middleware; the brochure is in `(marketing)` | Different route groups produce different client manifests, so a graph-resolution bug can affect one and not the other |

## Fix (already pushed in `bbb8e63a`)

```ts
'use client'

import confetti from 'canvas-confetti'

export function fireConfetti(): void {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 40,
    ticks: 200,
    scalar: 0.85,
    colors: ['#1E4D7B', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#03A9F4'],
  })
}
```

Two changes:
1. Add `'use client'` so Turbopack treats this module as part of the client graph.
2. Replace dynamic `import()` with a top-level **static** `import`. Turbopack now bundles canvas-confetti into whatever client chunk pulls in `lib/confetti.ts` at build time. No runtime module-graph lookup. No promise that can silently reject.

Trade-off: the canvas-confetti library (~10KB minified) is now loaded immediately with the materials page chunks instead of on first correct answer. For a 10KB library, this is the right call — eager bundling beats a silently-broken on-demand load.

## Why the fix matches `fireCelebrationConfetti.ts`

`lib/fireCelebrationConfetti.ts` already used the static-import pattern with `'use client'`, and the test-submission confetti (which uses it from `app/(student)/dashboard/tests/[id]/page.tsx`) does fire correctly. The materials helper now follows the same shape — one fewer asymmetry in the codebase.

## Verification

- `npm run build` → ✓ 43 routes, no errors, canvas-confetti present in 8 client chunks (where previously it was only in the brochure's chunk)
- `npm run lint` → 0 errors (only pre-existing `<img>` warnings unrelated to this change)
- Diff in `bbb8e63a` shows only `lib/confetti.ts` changed for the confetti part; no quiz pages had to be touched

## Out of scope / left alone

- `fireCelebrationConfetti.ts` is unchanged — it was already correct.
- The brochure inline call is unchanged — it works.
- The test detail page (`/dashboard/tests/[id]`) was already using the right pattern via `fireCelebrationConfetti()`.

## Open question for the user

After the PR merges and Vercel deploys, please verify the confetti now fires on:
1. `/dashboard/materials/curriculum-topic/0?view=exercise` — pick a correct answer
2. `/dashboard/literature-exercise/<any-work-id>` — pick a correct answer
3. `/dashboard/materials/math-7-topics` — pick a correct answer

If any of these still fail, the diagnosis was wrong and we need to look at runtime errors in DevTools console.
