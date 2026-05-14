# 4th Grade NVO Section Plan

## Summary

Add 4th grade NVO support for Bulgarian language and Mathematics only, using the single approved MON source URL:

https://www.mon.bg/obshto-obrazovanie/natsionalno-vanshno-otsenyavane-nvo/nvo-za-iv-klas/testove-i-verni-otgovori-ot-nvo-za-iv-klas-po-godini/

The implementation must match the existing 7th grade NVO and 12th grade DZI structures, use the current MathJax renderer, avoid external theory sources, and push the work on a new branch from latest `origin/main`.

## Existing Structure To Match

- Tests list: `app/(student)/dashboard/tests/page.tsx`
- Tests UI: `components/dashboard/TestsPageContent.tsx`
- Test detail renderer: `app/(student)/dashboard/tests/[id]/page.tsx`
- Test catalog: `data/tests.ts`
- Mock catalog mapping: `data/mock-tests.ts`
- Materials page: `app/(student)/dashboard/materials/page.tsx`
- Grade context/auth: `lib/grade-context.tsx`, `lib/auth.ts`
- Landing widgets/pricing: `components/marketing/ExamsSection.tsx`, `components/marketing/Pricing.tsx`
- Billing plans: `lib/billing/plans.ts`

Data shapes to extend:

- `Grade`: add `'4'`
- `Test.examType`: add `'nvo4'`
- official exam `exam_type`: add `'nvo4_bel'` and `'nvo4_math'`
- `PlanKey`: add `'nvo4-full'`

## Math Rendering

Use the existing MathJax setup only. Test details already load MathJax v3 and support `\(...\)` and `$...$`; grade 7 math materials use the same MathJax family plus helpers in `lib/math-text.ts`. New 4th grade math formulas will use the same delimiter style. If PDF extraction cannot faithfully reconstruct a formula or diagram, preserve the source crop as an image and record a formatting flag instead of guessing.

## Source Inventory

The MON page lists relevant materials as PDFs only.

Official Bulgarian and Math tests with answer keys exist for:

- 2025, 2024, 2023, 2022, 2021
- 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007

There is no 2020 official entry on the source page.

Model/sample tests:

- 2025 model: Bulgarian and Math PDFs
- 2024 model: Bulgarian and Math PDFs
- 2013 sample: Bulgarian and Math PDFs

Off-scope links for "Човекът и природата" and "Човекът и обществото" must be ignored.

## Formatting Pitfalls And Handling

- Embedded formulas or diagrams: preserve as cropped images when text extraction is unreliable.
- Broken superscripts, fractions, parentheses, and special glyphs: convert only when deterministic; otherwise flag.
- Mixed question numbering or merged answer options: validate contiguous numbering and option labels.
- Answer keys mixed into the same PDF: parse into `correct_option` or `official_answer`; use TODO if missing.
- Header/footer/page boilerplate leaking into questions: strip predictable boilerplate and report ambiguous removals.
- Encoding artifacts/private glyphs: normalize known mappings only; flag unknown characters.

## Implementation Plan

- Add grade 4 platform support in grade context, auth/profile/register/class selection, Supabase class validation, subjects, tests, and billing.
- Add 4th grade official and model/sample test data under `data/`, with IDs such as `nvo4-bel-2025`, `nvo4-math-2025`, `nvo4_2025_bel`, and `nvo4_2025_math`.
- Add a scraper/converter that fetches only the approved MON page, derives allowed Bulgarian/Math PDF links from that page, downloads only those PDFs, writes datasets/assets/reports, and rejects off-scope subjects.
- Add 4th grade tests page filters for Bulgarian and Math, preserving existing 7th/12th behavior.
- Add a grade 4 branch on the materials page with Bulgarian and Math tabs and TODO-only theory/study material placeholders.
- Add landing exam widgets for 4th grade.
- Add `nvo4-full` as a true monthly recurring subscription priced at 19.99 EUR.

## Test Plan

- Validate that only Bulgarian and Math links from the approved page are included.
- Validate official years match the source page exactly, including no 2020.
- Validate model/sample PDFs are separate from official past tests.
- Validate each generated exam has non-empty questions, valid numbering, and no unflagged extraction artifacts.
- Run lint/build checks.
- Browser-check grade 4 tests, grade 4 materials, landing exam widgets, and pricing.

## Assumptions

- Theory content remains TODO-only; no external theory source is used.
- The 4th grade plan is a monthly recurring subscription at 19.99 EUR.
- Existing 7th and 12th grade behavior remains unchanged.
- Ambiguous PDF content is flagged or marked TODO, not silently repaired.
