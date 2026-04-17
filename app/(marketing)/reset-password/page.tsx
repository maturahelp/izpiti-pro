'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canReset, setCanReset] = useState(false)
  const [success, setSuccess] = useState(false)

  // When Supabase sends the recovery email, clicking it lands here with
  // a recovery token. The browser client auto-handles the hash, then fires
  // a PASSWORD_RECOVERY event. We listen for it to allow password update.
  useEffect(() => {
    const supabase = createClient()
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCanReset(true)
      }
    })
    // Also check: if a session already exists (e.g. page reloaded),
    // the user can still update their password.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setCanReset(true)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Паролата трябва да е поне 8 знака.'); return }
    if (password !== confirmPassword) { setError('Паролите не съвпадат.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message || 'Нещо се обърка. Опитай отново.')
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/dashboard/materials'), 1500)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] px-8 py-7">

          <div className="flex items-center gap-2.5 justify-center mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/[0.08] border border-primary/15 flex items-center justify-center shadow-sm flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#2F4E85" strokeWidth="1.6" strokeLinejoin="round" fill="white"/>
                <path d="M14 8V23" stroke="#2F4E85" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-serif font-bold text-text text-[18px] tracking-[-0.02em]">MaturaHelp</span>
          </div>

          <h2 className="text-[19px] font-bold text-text text-center tracking-[-0.02em] mb-0.5">
            Нова парола
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-5">
            Избери нова парола за акаунта си
          </p>

          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <p className="text-[15px] font-semibold text-text">Паролата е сменена</p>
              <p className="text-[13px] text-text-muted">Пренасочваме те към приложението...</p>
            </div>
          ) : !canReset ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-[13px] text-text-muted">
                Отвори линка за смяна на парола от имейла си, за да стигнеш до тази страница.
              </p>
              <Link href="/forgot-password" className="inline-block mt-2 text-[13px] text-primary font-semibold hover:underline">
                Заяви нов линк
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block text-[12.5px] font-semibold text-text mb-1.5">Нова парола</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 8 знака"
                      autoFocus
                      className="w-full px-4 py-2.5 pr-14 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-muted hover:text-text transition"
                    >
                      {showPassword ? 'Скрий' : 'Покажи'}
                    </button>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[12.5px] font-semibold text-text mb-1.5">Потвърди паролата</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повтори паролата"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Запазване...' : 'Запази нова парола'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
