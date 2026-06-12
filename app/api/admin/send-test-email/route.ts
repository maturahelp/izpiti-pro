import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { renderEmailAutomationTemplate } from '@/lib/email-automation/templates'
import { sendResendEmail } from '@/lib/email-automation/resend'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { email, name } = (await req.json()) as { email?: string; name?: string }

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const rendered = renderEmailAutomationTemplate({
    templateKey: 'nvo7_urgency_nudge',
    recipientEmail: email,
    recipientName: name ?? null,
  })

  try {
    const { id } = await sendResendEmail({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    })
    return NextResponse.json({ ok: true, to: email, subject: rendered.subject, id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
