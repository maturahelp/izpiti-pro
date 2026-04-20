'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'
import { createClient } from '@/lib/supabase/client'
import { getUser } from '@/lib/auth'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUser().then((u) => setEmail(u?.email || ''))
  }, [])

  async function handlePasswordReset() {
    if (!email) { setError('Не открихме имейла на акаунта ти.'); return }
    setError(null)
    setMessage(null)
    setLoading(true)
    const supabase = createClient()
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)
    if (resetError) {
      setError(resetError.message || 'Нещо се обърка.')
      return
    }
    setMessage(`Изпратихме линк за смяна на паролата на ${email}.`)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Настройки" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        {/* Account */}
        <div className="card p-6">
          <h2 className="text-base font-serif font-bold text-text mb-1">Акаунт</h2>
          <p className="text-sm text-text-muted mb-4">Имейл свързан с профила</p>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-slate-50 text-sm text-text">
            {email || '—'}
          </div>
        </div>

        {/* Password */}
        <div className="card p-6">
          <h2 className="text-base font-serif font-bold text-text mb-1">Парола</h2>
          <p className="text-sm text-text-muted mb-4">
            Ще ти изпратим имейл с линк за смяна на паролата.
          </p>
          {error && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-[13px] text-green-700">
              {message}
            </div>
          )}
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={loading}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Изпращане...' : 'Изпрати линк за смяна'}
          </button>
        </div>

        <div className="text-center">
          <Link href="/dashboard/profile" className="text-sm text-primary font-semibold hover:underline">
            Към профила
          </Link>
        </div>
      </div>
    </div>
  )
}
