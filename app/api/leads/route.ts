import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidPhone(raw: string): boolean {
  const stripped = raw.replace(/[\s\-()]/g, '')
  if (stripped.startsWith('+')) return /^\+[1-9]\d{8,14}$/.test(stripped)
  if (stripped.startsWith('0')) return /^0\d{8,14}$/.test(stripped)
  return /^\d{9,15}$/.test(stripped)
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown; phone?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const source = typeof body.source === 'string' ? body.source : 'unknown'

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 })
  }

  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ error: 'INVALID_PHONE' }, { status: 400 })
  }

  // TODO(crm): persist to Supabase `leads` table OR forward to email-marketing
  // provider (Brevo / Mailchimp / HubSpot) when one is chosen.
  // Example Supabase call:
  //   const admin = createAdminClient()
  //   await admin.from('leads').upsert({ email, phone: phone || null, source }, { onConflict: 'email' })
  console.log('[lead]', { email, phone: phone || null, source, at: new Date().toISOString() })

  return NextResponse.json({ ok: true })
}
