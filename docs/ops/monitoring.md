# Мониторинг на maturahelp.com

Как знаем, че сайтът работи, кога нещо се чупи и какво се е променило. Четири части, свързани в едно.

| Част | Какво прави | Къде живее |
|---|---|---|
| Site Watcher | Жив ли е сайтът в момента | UptimeRobot (24/7, на 5 мин) + `scripts/ops/site-check.mjs` |
| Backend Health | Supabase/Vercel/Stripe счупени ли са „тихо“ | `GET /api/health` + дневен отчет (сканира имейлите за аларми) |
| Change Log | Какво се е променило и защо | `CHANGELOG.md` + Claude Code Stop hook |
| Status Dashboard | Всичко на едно място | Claude Artifact „MaturaHelp Status“ (пълни се от дневния отчет) |

## 1. Site Watcher

### UptimeRobot (външен, 24/7)

Безплатният план проверява на 5 минути и праща имейл при спад. Настройка, еднократно:

1. Регистрация в uptimerobot.com с slavi.ivanov06@gmail.com.
2. Добави мониторите по-долу (тип HTTP(s), interval 5 min, alert contact = имейл).
3. При „Down“ имейлът пристига до ~5 минути. Дневният отчет също го вижда (търси го в Gmail).

| Име | URL | Очаквано |
|---|---|---|
| Home | https://www.maturahelp.com/ | 200 |
| Login | https://www.maturahelp.com/login | 200 |
| Dashboard redirect | https://www.maturahelp.com/dashboard | 200 (редиректва към /login) |
| API health | https://www.maturahelp.com/api/health | 200 и `"ok":true` (тип Keyword, keyword `"ok":true`) |

Забележка: `maturahelp.com` без `www` връща 308 към `www` (нарочно, `next.config.ts`). Мониторирай `www` адресите.

### Ръчна проверка

```bash
node scripts/ops/site-check.mjs
```

Печата JSON със статус, латентност и краен URL на всяка страница. `--quiet` дава един ред. Exit code 1 при проблем.
Над 3000 ms се брои за „бавно“ и се отбелязва в `detail`.

## 2. Backend Health

### `GET /api/health`

Публичен, без секрети. Връща:

```json
{
  "ok": true,
  "status": "ok",
  "timestamp": "2026-09-12T06:00:00.000Z",
  "commit": "bdcacf5",
  "region": "fra1",
  "checks": {
    "supabase": { "ok": true, "ms": 120 },
    "env": { "ok": true, "missingCount": 0 }
  },
  "totalMs": 130
}
```

- `supabase`: един лек `count`/`head` заявка към `profiles` през service role. Timeout 8 s.
- `env`: проверка дали задължителните env vars са зададени във Vercel. Имената на липсващите се показват само с `Authorization: Bearer <CRON_SECRET>`.
- HTTP 503 при проблем, 200 при ОК. `Cache-Control: no-store`.

Ако `supabase.ok=false`: погледни Supabase dashboard → Project → Logs и Usage (пауза заради лимит на free plan е класиката).
Ако `env.ok=false`: Vercel → Project → Settings → Environment Variables; след промяна е нужен redeploy.

### Откъде идват „тихите“ грешки

Sentry не е включен (виж раздел 5). Дотогава сигналите са имейлите, които услугите вече пращат:

- Vercel: „Deployment failed“, „Build error“.
- Supabase: „approaching usage limit“, „project paused“.
- Stripe: „webhook endpoint failing“, „payment failed“.
- UptimeRobot: „is DOWN“ / „is UP“.

Дневният отчет ги търси в Gmail за последните 24 часа и ги брои като „грешки“.

## 3. Change Log

`CHANGELOG.md` в корена. Правила (същите са в `CLAUDE.md`):

- Всеки, който променя код/данни/конфигурация, добавя ред под `## YYYY-MM-DD` най-отгоре.
- Формат: `- type(scope): какво — защо (автор)`. „Защо“-то е важното; git log го няма.
- Claude Code го прави сам в края на сесията. Ако забрави, Stop hook-ът (`.claude/hooks/changelog-guard.mjs`, включен от `.claude/settings.json`) го спира и иска запис. Hook-ът гледа некомитнатите промени и комитите на текущия branch спрямо `origin/main`; docs/markdown промени не изискват запис.
- Дневният отчет сравнява комитите от последните 7 дни с CHANGELOG и отбелязва пропуснатите.

## 4. Дневен отчет и Status Dashboard

Локална Claude scheduled задача „MaturaHelp: дневен статус“ (работи в Claude app на машината на Слави, всеки ден в 09:00; ако app-ът е бил затворен, се пуска при следващото отваряне). Прави:

1. `node scripts/ops/site-check.mjs` от локалното репо (`C:\Users\GRIGS\Projects\izpiti-pro`).
2. Търси в Gmail аларми от Vercel/Supabase/Stripe/UptimeRobot за последните 24 ч.
3. Тегли `CHANGELOG.md` от `main` в GitHub и последните комити.
4. Записва резултата в базата на дашборда (Artifact db) и праща кратък имейл до slavi.ivanov06@gmail.com: „✅ OK“ или „🔴 Проблем“ + какво точно.

Дашбордът показва: статус на сайта от последната проверка, латентност по страници, брой аларми за 24 ч, история за последните 14 дни, последните промени от CHANGELOG. Линкът е в Claude → Artifacts („MaturaHelp Status“).

## 5. Sentry (още не е включен)

Sentry е услуга, която хваща грешките в кода **в реално време**: когато на потребител му гръмне страница или API route върне 500, Sentry записва stack trace, кой потребител, кой браузър, кой commit, и праща имейл/Slack до минута. Без него виждаме само това, което Vercel логва, и то само ако го гледаме.

Кога си струва: когато има реални потребители и плащания (т.е. сега). Безплатният план (5k events/месец) стига за този трафик.

Как се включва (отделен PR, ~1 час):

1. Акаунт в sentry.io → New project → Next.js → копирай DSN.
2. `npx @sentry/wizard@latest -i nextjs` в репото; добавя `@sentry/nextjs`, `instrumentation.ts`, `sentry.*.config.ts`, `app/global-error.tsx` и обвива `next.config.ts` с `withSentryConfig`.
3. В `next.config.ts` CSP `connect-src` добави `https://*.ingest.sentry.io` (иначе браузърните грешки не стигат).
4. Vercel env: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (за source maps), `SENTRY_ORG`, `SENTRY_PROJECT`.
5. Sentry → Alerts → имейл при нов issue. Дневният отчет ще брои и тези имейли.

## Бърз checklist при „сайтът не работи“

1. Отвори https://www.maturahelp.com/api/health. 503 или timeout → Vercel status / Supabase dashboard.
2. Vercel → Deployments: последният deploy зелен ли е? Ако не, `Rollback` към предишния.
3. Supabase → Project paused? → Restore.
4. Stripe → Developers → Webhooks: има ли failing endpoint?
5. Провери CHANGELOG.md и последните комити: какво е сменяно последно?
