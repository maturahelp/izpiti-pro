import { NextRequest, NextResponse } from 'next/server'
import { processEmailAutomationJobs } from '@/lib/email-automation/processor'

export const runtime = 'nodejs'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  const authorization = req.headers.get('authorization')
  return authorization === `Bearer ${secret}`
}

function resolveLimit(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('limit')
  const parsed = raw ? Number.parseInt(raw, 10) : NaN

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20
  }

  return Math.min(parsed, 50)
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const result = await processEmailAutomationJobs(resolveLimit(req))
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[email-automations cron] failed', error)
    return NextResponse.json({ error: 'PROCESSING_FAILED' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
