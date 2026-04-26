import { NextResponse } from 'next/server'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Гард за всички /api/admin/* routes. Връща userId на админа, или
 * NextResponse с 401/403, ако заявката не е оторизирана.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 500 }),
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }),
    }
  }

  return { ok: true, userId: user.id }
}
