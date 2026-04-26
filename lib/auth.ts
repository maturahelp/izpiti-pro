import { createClient } from '@/lib/supabase/client'
import type { RegistrationConsentMetadata } from '@/lib/legal-consent'

function previewAuthUnavailableError() {
  return { message: 'Входът временно не е наличен в preview средата.' }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { user: data?.user ?? null, session: data?.session ?? null, error }
  } catch {
    return { user: null, session: null, error: previewAuthUnavailableError() }
  }
}

export async function signUp(email: string, password: string, name?: string, consent?: RegistrationConsentMetadata) {
  try {
    const supabase = createClient()
    const displayName = name?.trim() || email.split('@')[0]
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: displayName, ...(consent ?? {}) } },
    })
    return { user: data?.user ?? null, session: data?.session ?? null, error }
  } catch {
    return { user: null, session: null, error: previewAuthUnavailableError() }
  }
}

export async function verifySignupOtp(email: string, token: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })
    return { user: data?.user ?? null, session: data?.session ?? null, error }
  } catch {
    return { user: null, session: null, error: previewAuthUnavailableError() }
  }
}

export async function resendSignupOtp(email: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    return { error }
  } catch {
    return { error: previewAuthUnavailableError() }
  }
}

export async function signOut() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch {
    // In preview builds without Supabase envs, sign-out should fail quietly.
  }
}

export async function getUser() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
