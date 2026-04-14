import { createClient } from '@/lib/supabase/client'
import { USER_PROFILE_COLUMNS, type UserProfile } from '@/lib/profile'

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data?.user ?? null, session: data?.session ?? null, error }
}

export async function signUp(email: string, password: string, name?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name ?? email.split('@')[0] } },
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

export async function getProfile() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('profiles')
    .select(USER_PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle()

  return (data as UserProfile | null) ?? null
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  return { error }
}

export async function updatePassword(password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })
  return { error }
}
