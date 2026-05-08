'use server'

import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordResetEmail } from '@/lib/email/resend'

export async function requestPasswordReset(formData: FormData): Promise<{ ok: true }> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: true }
  }

  try {
    const headersList = await headers()
    const origin =
      headersList.get('origin') ??
      process.env.NEXT_PUBLIC_BASE_URL ??
      'https://maturahelp.com'

    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    if (error) {
      console.error('[forgot-password] generateLink error:', error.message)
      return { ok: true }
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink) {
      console.error('[forgot-password] generateLink returned no action_link')
      return { ok: true }
    }

    await sendPasswordResetEmail({ to: email, actionLink })
  } catch (err) {
    console.error('[forgot-password] unexpected error:', err)
  }

  return { ok: true }
}
