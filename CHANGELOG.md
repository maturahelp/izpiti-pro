# Changelog

Всички значими промени по maturahelp.com (izpiti-pro), най-новите отгоре.
Формат на ред: `- type(scope): какво — защо (автор)`. Типове: feat, fix, style, refactor, chore, docs.
Кой и кога го допълва: виж `docs/ops/monitoring.md`, раздел „Change Log“.
Дневният ops отчет и Status Dashboard четат този файл, затова пази заглавията `## YYYY-MM-DD`.

## [Unreleased]

## 2026-09-12

- chore(ops): добавен публичен `/api/health` (проверка на Supabase + наличие на env vars) — за UptimeRobot и дневния отчет (Claude Code / Слави)
- chore(ops): добавен `scripts/ops/site-check.mjs` — мери статус и латентност на ключовите страници (Claude Code / Слави)
- chore(ops): добавен Claude Code Stop hook `.claude/hooks/changelog-guard.mjs` — напомня за CHANGELOG запис в края на сесия с промени (Claude Code / Слави)
- docs(ops): добавен `docs/ops/monitoring.md` — runbook за мониторинг, известия и дашборд (Claude Code / Слави)
- docs: този CHANGELOG, засят от git историята до 2026-09-06 (Claude Code / Слави)

## 2026-09-06

- fix(db): resolve duplicate migration version 008 — possible broken 4th-grade signups (Slavi)
- fix(db): resolve duplicate migration version 006 blocking new migrations (Slavi)
- chore(assets): remove unused files from public/nvo_pdfs (123MB -> 6.5MB) (Slavi)
- chore(ci): add the CI workflow — build + lint + test on PR and push to main (Slavi)
- fix(seo): add /brochure to sitemap.ts (Slavi)
- fix(payments): stop leaking raw errors, validate refund ownership (Slavi)
- fix(security): close unauthenticated access to NVO rich literature summaries (Slavi)
- fix(leads): persist discount-popup leads instead of discarding them (Slavi)
- fix(email): stop hardcoding NVO7 exam dates in urgency nudge copy (Slavi)
- fix(landing): replace placeholder testimonial, fix CSP gaps, add 404 page (Slavi)

## 2026-08-12

- fix(pricing): remove stale June 2026 exam dates from NVO plan copy (Slavi)

## 2026-07-23

- fix(billing): remove hardcoded expiry from dzi-english-sprint plan (Slavi)
- fix(billing): remove hardcoded expiry from nvo-full one-time plan (Slavi)

## 2026-07-08

- feat(pricing): rename sprint plans to Лятна подготовка, make monthly (Slavi)

## 2026-06-12

- feat(admin): add email-stats endpoint for job status overview (Slavi)
- feat(admin): add send-test-email endpoint for previewing email templates (Slavi)
- fix(cron): change schedule to daily 7am — Vercel Hobby plan limit (Slavi)
- feat(checkout): allow NVO15 promo code on nvo-sprint + direct email CTA (Slavi)
- feat(email): add NVO15 discount code to nvo7 urgency nudge email (Slavi)

## 2026-06-11

- feat(cron): add Vercel cron every 10min + admin process-emails endpoint (Slavi)
- fix(tests): replace MathJax CDN with bundled KaTeX for math rendering (Slavi)
- fix(campaigns): serialize supabase errors as JSON in nvo7 campaign route (Slavi)
- feat(email): add NVO 7 urgency nudge email + bulk campaign endpoint (Slavi)

## 2026-05-28

- feat(marketing): default to НВО 7, drop ДЗИ English plan, ДЗИ → monthly 9.99€ (Slavi)

## 2026-05-22 … 2026-05-27

- feat(nvo): rich summaries + exercises for all NVO 7 literature works (Slavi)
- fix(nvo): balance answer lengths, restore truncated quotes, fix factual errors and grammar in literature exercises (Slavi)
