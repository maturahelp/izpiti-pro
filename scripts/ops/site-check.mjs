#!/usr/bin/env node
// Probes the key pages of maturahelp.com and prints a JSON report.
// Used by the daily ops report task and for manual checks:
//   node scripts/ops/site-check.mjs            # pretty JSON to stdout
//   node scripts/ops/site-check.mjs --quiet    # one-line summary
// Exit code is 0 when every page is OK, 1 otherwise. No dependencies.

const BASE = process.env.SITE_BASE_URL || 'https://www.maturahelp.com'
const TIMEOUT_MS = 20_000
const SLOW_MS = 3_000

// `expect` describes what "healthy" means for each page.
const PAGES = [
  { path: '/', name: 'Начална страница', expect: { status: 200 } },
  { path: '/login', name: 'Вход', expect: { status: 200 } },
  { path: '/dashboard', name: 'Дашборд (гост → login)', expect: { status: 200, finalPathIncludes: '/login' } },
  { path: '/api/health', name: 'API health (Supabase)', expect: { status: 200, jsonOk: true } },
]

async function probe(page) {
  const url = BASE + page.path
  const started = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const result = { path: page.path, name: page.name, url, ok: false, status: null, ms: null, finalUrl: null, detail: null }
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'maturahelp-ops-check/1.0', accept: 'text/html,application/json' },
    })
    result.ms = Date.now() - started
    result.status = res.status
    result.finalUrl = res.url
    let ok = res.status === page.expect.status
    if (page.expect.finalPathIncludes && !new URL(res.url).pathname.includes(page.expect.finalPathIncludes)) {
      ok = false
      result.detail = `expected redirect to ${page.expect.finalPathIncludes}`
    }
    if (page.expect.jsonOk) {
      try {
        const json = await res.json()
        result.detail = json
        if (json.ok !== true) ok = false
      } catch {
        ok = false
        result.detail = 'invalid JSON'
      }
    }
    if (ok && result.ms > SLOW_MS) result.detail = result.detail ?? `slow (> ${SLOW_MS} ms)`
    result.ok = ok
  } catch (err) {
    result.ms = Date.now() - started
    result.detail = err?.name === 'AbortError' ? `timeout after ${TIMEOUT_MS} ms` : String(err?.message ?? err)
  } finally {
    clearTimeout(timer)
  }
  return result
}

const pages = await Promise.all(PAGES.map(probe))
const report = {
  checkedAt: new Date().toISOString(),
  base: BASE,
  allOk: pages.every((p) => p.ok),
  slowCount: pages.filter((p) => p.ok && p.ms > SLOW_MS).length,
  pages,
}

if (process.argv.includes('--quiet')) {
  const line = pages.map((p) => `${p.ok ? 'OK' : 'FAIL'} ${p.path} ${p.status ?? '-'} ${p.ms}ms`).join(' | ')
  console.log(`${report.allOk ? 'ALL OK' : 'PROBLEM'} — ${line}`)
} else {
  console.log(JSON.stringify(report, null, 2))
}
process.exit(report.allOk ? 0 : 1)
