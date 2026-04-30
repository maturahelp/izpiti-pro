# Live Landing Social Icons Design

## Goal

Add Instagram and TikTok links to the live landing page footer and style them as filled glyph icons that match the provided reference while preserving the existing MaturaHelp blue/navy palette.

## Live Route Ownership

The public homepage is served by `app/route.ts`, which returns `landing-source.html` directly. The React marketing `Header` and `Footer` components are not part of the live homepage render path, so this change must be implemented in `landing-source.html`.

## Placement

- Footer only: place the icon pair below the support email in the brand column.
- Do not render social icons in the desktop header or mobile menu.

## Visual Treatment

- Use filled Instagram and TikTok glyphs, matching the silhouette of the supplied reference.
- Keep icons monochrome and drive their color from `currentColor`.
- On the dark footer, use a muted blue-white default state and a brighter blue hover state.
- Reuse a shared social icon class family for the footer links.

## Accessibility

- Each icon link keeps a clear `aria-label`.
- External links open in a new tab with `rel="noopener noreferrer"`.

## Verification

- Add a regression test that reads `landing-source.html` and verifies the social links are present only in the footer.
- Run the targeted `node --test` command and a full `npm run build`.
- Inspect the rendered homepage HTML locally to confirm the live route includes the new links.
