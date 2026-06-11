import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { processEmailAutomationJobs } from '@/lib/email-automation/processor'

export const runtime = 'nodejs'

/**
 * POST /api/admin/process-emails
 * Manually trigger email automation processing (admin only).
 */
export async function POST() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const result = await processEmailAutomationJobs(50)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
