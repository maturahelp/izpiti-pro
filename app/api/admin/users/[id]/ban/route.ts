import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { id } = await params
  const body = await req.json().catch(() => ({})) as { ban?: boolean }
  const ban = Boolean(body.ban)

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: ban ? '876600h' : 'none',
  } as { ban_duration: string })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, banned: ban })
}
