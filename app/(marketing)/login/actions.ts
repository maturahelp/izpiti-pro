'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function safeRedirectTo(raw: string): string {
  if (!raw) return '/dashboard/materials'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard/materials'
  return raw
}

export type LoginActionResult = { error?: string }

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const redirectTo = safeRedirectTo(String(formData.get('redirectTo') ?? ''))

  if (!email || !password) {
    return { error: 'Попълни всички полета.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message?.includes('Email not confirmed')
      ? 'Имейлът не е потвърден. Провери пощата си и кликни линка за потвърждение.'
      : 'Грешен имейл или парола.'
    return { error: msg }
  }

  redirect(redirectTo)
}
