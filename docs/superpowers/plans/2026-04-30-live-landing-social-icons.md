# Live Landing Social Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add styled Instagram and TikTok links to the live homepage footer in `landing-source.html`.

**Architecture:** Keep the change on the live static landing page instead of the unused React marketing components. Add a shared social-icon utility class plus one footer markup insertion that reuses filled SVG glyphs matching the approved reference.

**Tech Stack:** Next.js app route serving static HTML, Tailwind utility classes in markup, inline CSS in `landing-source.html`, Node `node:test` regression coverage.

---

### Task 1: Regression Test

**Files:**
- Create: `test/landing-social-links.test.mjs`
- Test: `test/landing-social-links.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const landingHtml = fs.readFileSync(path.join(repoRoot, 'landing-source.html'), 'utf8')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/landing-social-links.test.mjs`
Expected: FAIL because the homepage HTML does not yet include the social link markers.

- [ ] **Step 3: Write minimal implementation**

Add `data-social-link` markers for `instagram` and `tiktok` in the footer inside `landing-source.html`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/landing-social-links.test.mjs`
Expected: PASS

### Task 2: Footer Markup And Styles

**Files:**
- Modify: `landing-source.html`
- Test: `test/landing-social-links.test.mjs`

- [ ] **Step 1: Add shared icon styles**

```html
<style>
  .social-icon-link { ... }
  .social-icon-link--footer { ... }
</style>
```

- [ ] **Step 2: Add footer icon row**

```html
<a data-social-link="instagram" data-social-surface="footer" ...>...</a>
<a data-social-link="tiktok" data-social-surface="footer" ...>...</a>
```

- [ ] **Step 3: Run focused verification**

Run: `node --test test/landing-social-links.test.mjs`
Expected: PASS

### Task 3: Final Verification

**Files:**
- Modify: `landing-source.html`
- Test: `test/landing-social-links.test.mjs`

- [ ] **Step 1: Build the app**

Run: `npm run build`
Expected: successful Next.js production build

- [ ] **Step 2: Check the live route output locally**

Run: `npm run dev`
Run: `curl -s http://localhost:3335/ | rg "data-social-link|instagram|tiktok"`
Expected: homepage HTML includes only the footer social links

- [ ] **Step 3: Commit**

```bash
git add landing-source.html test/landing-social-links.test.mjs docs/superpowers/specs/2026-04-30-live-landing-social-icons-design.md docs/superpowers/plans/2026-04-30-live-landing-social-icons.md
git commit -m "feat(landing): add live social icon links"
```
