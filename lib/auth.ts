import { createClient } from '@/lib/supabase/client'
import type { RegistrationConsentMetadata } from '@/lib/legal-consent'

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data?.user ?? null, session: data?.session ?? null, error }
}

export async function signUp(email: string, password: string, name?: string, consent?: RegistrationConsentMetadata) {
  const supabase = createClient()
  const displayName = name?.trim() || email.split('@')[0]
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: displayName, ...(consent ?? {}) } },
  })
  return { user: data?.user ?? null, session: data?.session ?? null, error }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
