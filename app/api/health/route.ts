import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public liveness/readiness endpoint used by uptime monitors and the daily
// ops report (see docs/ops/monitoring.md). It must stay cheap: one HEAD-style
// count query against Supabase and a presence check of required env vars.
// Never return secrets or raw error messages here — the endpoint is public.

const SUPABASE_TIMEOUT_MS = 8_000

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'RESEND_API_KEY',
  'CRON_SECRET',
] as const

type CheckResult = { ok: boolean; ms: number; error?: string }

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

async function checkSupabase(): Promise<CheckResult> {
  const started = Date.now()
  try {
    const admin = createAdminClient()
    const { error } = await withTimeout<{ error: { message: string } | null }>(
      admin.from('profiles').select('id', { count: 'exact', head: true }).limit(1),
      SUPABASE_TIMEOUT_MS
    )
    const ms = Date.now() - started
    if (error) {
      console.error('[health] supabase query failed', error)
      return { ok: false, ms, error: 'QUERY_FAILED' }
    }
    return { ok: true, ms }
  } catch (err) {
    const ms = Date.now() - started
    const message = err instanceof Error ? err.message : ''
    console.error('[health] supabase check failed', err)
    return { ok: false, ms, error: message === 'TIMEOUT' ? 'TIMEOUT' : 'UNAVAILABLE' }
  }
}

function checkEnv() {
  const missing = REQUIRED_ENV.filter((name) => {
    if (name === 'SUPABASE_SERVICE_ROLE_KEY') {
      return !process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE
    }
    return !process.env[name]
  })
  return { ok: missing.length === 0, missing }
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  const started = Date.now()
  const [supabase, env] = await Promise.all([checkSupabase(), Promise.resolve(checkEnv())])
  const ok = supabase.ok && env.ok

  const body: Record<string, unknown> = {
    ok,
    status: ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    region: process.env.VERCEL_REGION ?? null,
    checks: {
      supabase: { ok: supabase.ok, ms: supabase.ms, ...(supabase.error ? { error: supabase.error } : {}) },
      // Names of missing vars are only disclosed to callers holding CRON_SECRET.
      env: isAuthorized(req) ? env : { ok: env.ok, missingCount: env.missing.length },
    },
    totalMs: Date.now() - started,
  }

  return NextResponse.json(body, {
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
