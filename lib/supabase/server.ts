import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://lfxlxoocrdiaucywiavh.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmeGx4b29jcmRpYXVjeXdpYXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDExNTgsImV4cCI6MjA5MDY3NzE1OH0.sBvY_6FG7TWu7EWienDL7nZIpmAYrOrRqUamhmZyWOA'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cookies могат да се четат но не пишат
        }
      },
    },
  })
}
