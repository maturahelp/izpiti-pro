# Cookie Consent Banner Design

## Goal

Add a first-visit cookie consent flow to `izpiti-pro` so the site has a real user-facing consent UI that matches the existing cookies policy. The flow should show a compact bottom banner with `Accept` and `Manage`, open a compact preferences panel, persist the user's choice in a first-party cookie, and expose a footer control for reopening preferences later.

## Scope

In scope:

- Show the banner only when this browser has not saved a consent decision yet.
- Render a compact bottom banner with Bulgarian copy and two actions: `Приеми` and `Настройки`.
- Open a compact preferences panel with:
  - `Задължителни` always on and not editable
  - `Аналитични` toggle
  - `Маркетингови` toggle
- Persist consent in a first-party cookie with a version and update timestamp.
- Add a persistent footer action for reopening cookie settings after initial choice.
- Provide small helper APIs so future analytics/marketing scripts can gate on consent.

Out of scope for this change:

- Loading Meta, TikTok, Google Analytics, or other third-party scripts
- Server-side consent logging
- Geo-based banner behavior
- Multiple language variants

## User Experience

### First visit

If no consent cookie is present, the site shows a compact bottom banner above the page chrome. The banner copy should explain that the site uses essential cookies and optional analytics/marketing cookies, with a link to `/cookies`.

The banner actions:

- `Приеми` saves `essential=true`, `analytics=true`, `marketing=true`
- `Настройки` opens the compact preferences panel

### Preferences panel

The panel opens from the banner and later from the footer action. It should feel like a small elevated card or modal surface, not a full-page takeover.

The panel includes:

- short explanatory copy
- three rows for cookie categories
- disabled/locked `Задължителни`
- editable toggles for `Аналитични` and `Маркетингови`
- save action
- close/cancel action

The initial state when opened before any saved choice is:

- essential: on
- analytics: off
- marketing: off

### After consent

Once the user saves any choice, the initial banner disappears for that browser until the cookie is cleared or expires. The footer still exposes `Настройки за бисквитки` so the user can reopen the panel and update their selection.

## Architecture

### Storage

Use a first-party cookie named `mh_cookie_consent`.

Stored fields:

- `version`
- `essential`
- `analytics`
- `marketing`
- `updatedAt`

The cookie should use a durable max age such as 180 days, `path=/`, and `SameSite=Lax`.

### Runtime ownership

Use one lightweight browser runtime loaded in both the App Router layout and the raw landing page HTML. It will:

- read and validate the consent cookie on page load
- inject the banner and preferences panel into the DOM
- open settings from any element marked with `data-cookie-settings-trigger`
- save updated preferences back to the first-party cookie

This keeps the consent logic consistent across both `/` and the normal Next.js routes, including the landing page currently served from raw HTML.

### Files

- `lib/cookie-consent.ts`
  - cookie constants
  - consent types
  - serialization/parsing helpers
  - default preference helpers
- `lib/cookie-consent.test.ts`
  - helper coverage
- `public/cookie-consent.js`
  - banner/panel DOM runtime
  - cookie read/write behavior
  - settings trigger handling
- `components/marketing/Footer.tsx`
  - footer reopen control
- `app/layout.tsx`
  - one-time script load for App Router pages
- `landing-source.html`
  - one-time script load for `/`
  - footer reopen control for the landing page

## Behavior Rules

- No saved consent: show banner, panel closed by default.
- `Приеми`: save full consent and hide banner.
- `Настройки`: open the panel without saving.
- Saving custom preferences: save essential true plus chosen analytics/marketing values, hide banner, close panel.
- Footer reopen: open the same panel even when the banner is hidden.
- Invalid or malformed cookie data: ignore it and treat the visitor as new.

## Accessibility

- Use buttons, not plain clickable divs.
- Provide labels for the toggles.
- Make the preferences panel keyboard reachable.
- Keep contrast aligned with the existing brand palette.

## Verification

Minimum verification for this feature:

- helper tests for parsing/serialization/defaults
- targeted lint for touched files
- production build
- local browser review of first-visit banner, manage flow, save flow, and footer reopen action

## Assumptions

- Bulgarian copy is the correct default for the banner and footer control.
- The current repo does not yet load analytics or marketing scripts, so this change establishes consent state and gating hooks first.
