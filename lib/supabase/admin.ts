import { createClient } from '@supabase/supabase-js'

const MISSING_SUPABASE_ADMIN_ENV_MESSAGE =
  'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE

  if (!url || !serviceRoleKey) {
    throw new Error(MISSING_SUPABASE_ADMIN_ENV_MESSAGE)
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
