import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MISSING_TABLE_ERROR_CODE = 'PGRST205'

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

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('leads').upsert(
      { email, phone: phone || null, source, updated_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

    if (error) {
      if (error.code === MISSING_TABLE_ERROR_CODE) {
        console.warn('[leads] leads table missing in production, continuing without persistence')
      } else {
        console.error('[leads] upsert failed', error)
        // Still return ok — the discount code must not be withheld from the
        // visitor just because persistence had a hiccup.
      }
    }
  } catch (error) {
    console.error('[leads] unexpected error', error)
  }

  return NextResponse.json({ ok: true })
}
