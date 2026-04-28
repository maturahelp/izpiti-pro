'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifySignupOtp, resendSignupOtp } from '@/lib/auth'
import { BrandLogo } from '@/components/shared/BrandLogo'

function safeRedirectTo(raw: string | null): string {
  if (!raw) return '/dashboard/materials'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard/materials'
  return raw
}

const PENDING_VERIFY_KEY = 'pendingVerifyEmail'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectTo(searchParams.get('redirectTo'))
  const loginHref = `/login?redirectTo=${encodeURIComponent(redirectTo)}`

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    const fromQuery = searchParams.get('email')
    if (fromQuery) {
      setEmail(fromQuery)
      return
    }
    if (typeof window === 'undefined') return
    try {
      const pending = window.localStorage.getItem(PENDING_VERIFY_KEY)
      if (pending) setEmail(pending)
    } catch {}
  }, [searchParams])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!email) { setError('Въведи имейла, с който се регистрира.'); return }
    const code = otp.trim()
    if (code.length < 6) { setError('Въведи 6-цифрения код от имейла.'); return }
    setVerifying(true)
    const { session, error } = await verifySignupOtp(email, code)
    if (error) {
      setVerifying(false)
      setError(error.message || 'Невалиден или изтекъл код.')
      return
    }
    try { window.localStorage.removeItem(PENDING_VERIFY_KEY) } catch {}
    if (session) {
      window.location.href = redirectTo
      return
    }
    setVerifying(false)
    setInfo('Имейлът е потвърден. Влез с паролата си.')
  }

  async function handleResend() {
    setError(null)
    setInfo(null)
    if (!email) { setError('Въведи имейла си, за да получиш нов код.'); return }
    setResending(true)
    const { error } = await resendSignupOtp(email)
    setResending(false)
    if (error) { setError(error.message || 'Неуспешно повторно изпращане.'); return }
    try { window.localStorage.setItem(PENDING_VERIFY_KEY, email) } catch {}
    setInfo('Изпратихме нов код на имейла ти.')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] px-6 py-7 sm:px-8">

          <div className="flex items-center gap-2.5 justify-center mb-6">
            <BrandLogo className="h-9 w-9" />
            <span className="font-serif font-bold text-text text-[18px] tracking-[-0.02em]">MaturaHelp</span>
          </div>

          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="text-[19px] font-bold text-text text-center tracking-[-0.02em] mb-0.5">
            Потвърди имейла си
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-5">
            Въведи имейла и 6-цифрения код, който ти изпратихме.
          </p>

          {error && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-[13px] text-green-700">
              {info}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="mb-3">
              <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имейл адрес</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Въведи своя имейл"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
            <div className="mb-3">
              <label className="block text-[12.5px] font-semibold text-text mb-1.5">Код от имейла</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-center text-[18px] tracking-[0.5em] font-mono text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || otp.length < 6 || !email}
              className="w-full mt-1 py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {verifying ? 'Проверка...' : 'Потвърди'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-[12.5px]">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="text-primary font-semibold hover:underline disabled:opacity-40"
            >
              {resending ? 'Изпращане...' : 'Изпрати нов код'}
            </button>
            <Link href={loginHref} className="text-text-muted hover:text-text">
              Към страницата за вход
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
