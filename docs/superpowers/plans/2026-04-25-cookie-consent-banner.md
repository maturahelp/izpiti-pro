# Cookie Consent Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-visit cookie consent banner with a compact preferences panel, persist choices in a first-party cookie, and expose a footer entry for reopening settings.

**Architecture:** A shared browser runtime loaded from `public/cookie-consent.js` owns the consent UI and cookie persistence. It is included in both `app/layout.tsx` and `landing-source.html` so the same banner and preferences panel work on the raw homepage and on routed pages, while footer buttons use `data-cookie-settings-trigger` to reopen settings.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, Node test runner via `tsx`

---

### Task 1: Add consent helper module with tests

**Files:**
- Create: `lib/cookie-consent.ts`
- Create: `lib/cookie-consent.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_VERSION,
  createDefaultCookieConsent,
  parseCookieConsent,
  serializeCookieConsent,
} from './cookie-consent'

describe('cookie consent helpers', () => {
  it('creates the default preferences for a new visitor', () => {
    assert.deepEqual(createDefaultCookieConsent(), {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: '',
    })
  })

  it('serializes and parses a stored consent payload', () => {
    const updatedAt = '2026-04-25T19:05:00.000Z'
    const raw = serializeCookieConsent({
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: true,
      marketing: false,
      updatedAt,
    })

    assert.ok(raw.includes('%7B') || raw.includes('{'))
    assert.deepEqual(parseCookieConsent(raw), {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: true,
      marketing: false,
      updatedAt,
    })
  })

  it('rejects malformed or incompatible cookie payloads', () => {
    assert.equal(parseCookieConsent('not-json'), null)
    assert.equal(
      parseCookieConsent(
        serializeCookieConsent({
          version: 'old-version',
          essential: true,
          analytics: true,
          marketing: true,
          updatedAt: '2026-04-25T19:05:00.000Z',
        })
      ),
      null
    )
  })

  it('exports a stable cookie name for the browser storage key', () => {
    assert.equal(COOKIE_CONSENT_COOKIE_NAME, 'mh_cookie_consent')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cookie-consent.test.ts`
Expected: FAIL because `lib/cookie-consent.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const COOKIE_CONSENT_COOKIE_NAME = 'mh_cookie_consent'
export const COOKIE_CONSENT_VERSION = '2026-04-25'

export interface CookieConsentState {
  version: string
  essential: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

export function createDefaultCookieConsent(): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics: false,
    marketing: false,
    updatedAt: '',
  }
}

export function serializeCookieConsent(value: CookieConsentState) {
  return encodeURIComponent(JSON.stringify(value))
}

export function parseCookieConsent(raw: string | null | undefined): CookieConsentState | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsentState>

    if (
      parsed.version !== COOKIE_CONSENT_VERSION ||
      parsed.essential !== true ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null
    }

    return {
      version: parsed.version,
      essential: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cookie-consent.test.ts`
Expected: PASS with 4 passing assertions.

- [ ] **Step 5: Commit**

```bash
git add lib/cookie-consent.ts lib/cookie-consent.test.ts
git commit -m "feat(consent): add cookie consent helpers"
```

### Task 2: Add shared browser runtime and integration points

**Files:**
- Create: `public/cookie-consent.js`
- Modify: `app/layout.tsx`
- Modify: `landing-source.html`

- [ ] **Step 1: Write the failing UI integration expectation**

Add a narrow assertion to `lib/cookie-consent.test.ts` for the cookie options helper:

```ts
import { getCookieConsentCookieAttributes } from './cookie-consent'

it('uses durable cookie attributes for consent persistence', () => {
  assert.equal(
    getCookieConsentCookieAttributes(),
    'Max-Age=15552000; Path=/; SameSite=Lax'
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cookie-consent.test.ts`
Expected: FAIL because `getCookieConsentCookieAttributes` is not implemented yet.

- [ ] **Step 3: Extend the helper and write minimal UI implementation**

```ts
export function getCookieConsentCookieAttributes() {
  return 'Max-Age=15552000; Path=/; SameSite=Lax'
}
```

Runtime responsibilities:

```js
function init() {
  state.consent = parseConsent(readCookie(COOKIE_NAME))
  state.draft = state.consent ? { ...state.consent } : createDefaultConsent()
  ensureStyles()
  ensureRoot()
  document.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)
  render()
}
```

Load the runtime in both `app/layout.tsx` and `landing-source.html`.

- [ ] **Step 4: Run targeted verification**

Run:
- `npx tsx --test lib/cookie-consent.test.ts`
- `node --check public/cookie-consent.js`
- `npx eslint app/layout.tsx lib/cookie-consent.ts lib/cookie-consent.test.ts`

Expected:
- tests PASS
- `node --check` exits 0
- eslint exits 0 for only the touched files

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/shared/CookieConsentProvider.tsx components/shared/CookieConsentBanner.tsx components/shared/CookieConsentPreferences.tsx lib/cookie-consent.ts lib/cookie-consent.test.ts
git commit -m "feat(consent): add consent banner and preferences"
```

### Task 3: Add footer reopen action and final verification

**Files:**
- Modify: `components/marketing/Footer.tsx`
- Modify: `docs/superpowers/specs/2026-04-25-cookie-consent-banner-design.md`
- Modify: `docs/superpowers/plans/2026-04-25-cookie-consent-banner.md`

- [ ] **Step 1: Wire the footer reopen action**

Add a small client-only button in the footer links row:

```tsx
<button
  type="button"
  onClick={openPreferences}
  className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-200 font-medium"
>
  Настройки за бисквитки
</button>
```

If keeping `Footer.tsx` as a server component becomes awkward, extract a tiny client child such as `CookieSettingsButton.tsx` instead of converting the entire footer to client rendering.

- [ ] **Step 2: Run focused and app-level verification**

Run:
- `npx tsx --test lib/cookie-consent.test.ts`
- `npx eslint components/marketing/Footer.tsx components/shared/CookieConsentProvider.tsx components/shared/CookieConsentBanner.tsx components/shared/CookieConsentPreferences.tsx lib/cookie-consent.ts lib/cookie-consent.test.ts app/layout.tsx`
- `npm run build`

Expected:
- helper tests PASS
- targeted eslint exits 0
- build exits 0

- [ ] **Step 3: Manual browser verification**

Run: `npm run dev`

Check:
- first visit shows bottom banner
- `Настройки` opens the panel
- saving custom settings hides the banner
- refreshing preserves the choice
- footer `Настройки за бисквитки` reopens the panel after consent was already saved

- [ ] **Step 4: Commit**

```bash
git add components/marketing/Footer.tsx docs/superpowers/specs/2026-04-25-cookie-consent-banner-design.md docs/superpowers/plans/2026-04-25-cookie-consent-banner.md
git commit -m "feat(consent): add footer cookie settings access"
```
