'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signUp, signIn, verifySignupOtp, resendSignupOtp, type SignUpClass } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { buildRegistrationConsentMetadata, getBrowserUserAgent } from '@/lib/legal-consent'
import { RegistrationConsentFields, type RegistrationConsentValues } from '@/components/shared/LegalConsentFields'

function safeRedirectTo(raw: string | null): string {
  if (!raw) return '/dashboard/materials'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard/materials'
  return raw
}

const PENDING_VERIFY_KEY = 'pendingVerifyEmail'
const PENDING_CLASS_KEY = 'pendingVerifyClass'

async function persistSelectedClass(selected: SignUpClass) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ class: selected, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  } catch {
    // ignore — trigger should have set it from metadata anyway
  }
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectTo(searchParams.get('redirectTo'))
  const loginHref = `/login?redirectTo=${encodeURIComponent(redirectTo)}`
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedClass, setSelectedClass] = useState<SignUpClass | null>(null)
  const [consents, setConsents] = useState<RegistrationConsentValues>({
    acceptedTermsPrivacy: false,
    confirmedAge14: false,
    marketingEmails: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendInfo, setResendInfo] = useState<string | null>(null)

  // Restore pending verification state if the user closed the tab after signup
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const pending = window.localStorage.getItem(PENDING_VERIFY_KEY)
      if (pending) {
        setEmail(pending)
        setConfirmation(true)
      }
      const pendingClass = window.localStorage.getItem(PENDING_CLASS_KEY)
      if (pendingClass === '7' || pendingClass === '12') {
        setSelectedClass(pendingClass)
      }
    } catch {}
  }, [])

  function updateConsent(key: keyof RegistrationConsentValues, checked: boolean) {
    setConsents((current) => ({ ...current, [key]: checked }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selectedClass) { setError('Избери за какъв изпит се подготвяш.'); return }
    if (!email || !password) { setError('Попълни всички полета.'); return }
    if (password.length < 8) { setError('Паролата трябва да е поне 8 знака.'); return }
    if (password !== confirmPassword) { setError('Паролите не съвпадат.'); return }
    if (!consents.acceptedTermsPrivacy) { setError('За да продължиш, приеми Общите условия и Политиката за поверителност.'); return }
    if (!consents.confirmedAge14) { setError('Регистрацията е разрешена само за лица, навършили 14 години.'); return }
    setLoading(true)
    const consentMetadata = buildRegistrationConsentMetadata({
      ...consents,
      userAgent: getBrowserUserAgent(),
    })
    const { session, error } = await signUp(email, password, name, consentMetadata, selectedClass)
    if (error) { setLoading(false); setError(error.message); return }
    if (session) {
      await persistSelectedClass(selectedClass)
      try { window.localStorage.removeItem(PENDING_CLASS_KEY) } catch {}
      window.location.href = redirectTo
      return
    }
    // Email confirmation is enabled — try signing in anyway (works if confirmation is optional)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      // Confirmation required — show the check-your-email screen
      try {
        window.localStorage.setItem(PENDING_VERIFY_KEY, email)
        window.localStorage.setItem(PENDING_CLASS_KEY, selectedClass)
      } catch {}
      setConfirmation(true)
      return
    }
    await persistSelectedClass(selectedClass)
    try {
      window.localStorage.removeItem(PENDING_VERIFY_KEY)
      window.localStorage.removeItem(PENDING_CLASS_KEY)
    } catch {}
    window.location.href = redirectTo
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResendInfo(null)
    const code = otp.trim()
    if (code.length < 6) { setError('Въведи 6-цифрения код от имейла.'); return }
    setVerifying(true)
    const { session, error } = await verifySignupOtp(email, code)
    if (error) {
      setVerifying(false)
      setError(error.message || 'Невалиден или изтекъл код.')
      return
    }
    if (session) {
      if (selectedClass) await persistSelectedClass(selectedClass)
      try {
        window.localStorage.removeItem(PENDING_VERIFY_KEY)
        window.localStorage.removeItem(PENDING_CLASS_KEY)
      } catch {}
      window.location.href = redirectTo
      return
    }
    // Fallback — try password sign-in if confirmation was already done
    const { error: signInError } = await signIn(email, password)
    setVerifying(false)
    if (signInError) {
      setError('Кодът е приет, но входът не успя. Опитай от страницата за вход.')
      return
    }
    if (selectedClass) await persistSelectedClass(selectedClass)
    try {
      window.localStorage.removeItem(PENDING_VERIFY_KEY)
      window.localStorage.removeItem(PENDING_CLASS_KEY)
    } catch {}
    window.location.href = redirectTo
  }

  function handleChangeEmail() {
    try { window.localStorage.removeItem(PENDING_VERIFY_KEY) } catch {}
    setOtp('')
    setError(null)
    setResendInfo(null)
    setConfirmation(false)
  }

  async function handleResend() {
    setError(null)
    setResendInfo(null)
    setResending(true)
    const { error } = await resendSignupOtp(email)
    setResending(false)
    if (error) { setError(error.message || 'Неуспешно повторно изпращане.'); return }
    setResendInfo('Изпратихме нов код на имейла ти.')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] px-6 py-7 sm:px-8">

          {/* Logo */}
          <div className="flex items-center gap-2.5 justify-center mb-6">
            <BrandLogo className="h-9 w-9" />
            <span className="font-serif font-bold text-text text-[18px] tracking-[-0.02em]">MaturaHelp</span>
          </div>

          <h2 className="text-[19px] font-bold text-text text-center tracking-[-0.02em] mb-0.5">
            Създай акаунт
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-5">
            Безплатен старт — без кредитна карта
          </p>

          {confirmation ? (
            <div className="py-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <p className="text-[15px] font-semibold text-text text-center">Провери имейла си</p>
              <p className="text-[13px] text-text-muted text-center mb-1">
                Изпратихме 6-цифрен код на <strong>{email}</strong>. Въведи го по-долу.
              </p>
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-[12px] text-primary hover:underline"
                >
                  Сгрешен имейл? Промени го
                </button>
              </div>

              {error && (
                <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
                  {error}
                </div>
              )}
              {resendInfo && (
                <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-[13px] text-green-700">
                  {resendInfo}
                </div>
              )}

              <form onSubmit={handleVerify}>
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
                <button
                  type="submit"
                  disabled={verifying || otp.length < 6}
                  className="w-full mt-3 py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Проверка...' : 'Потвърди'}
                </button>
              </form>

              <div className="flex items-center justify-between mt-4 text-[12.5px]">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary font-semibold hover:underline disabled:opacity-40"
                >
                  {resending ? 'Изпращане...' : 'Изпрати нов код'}
                </button>
                <Link href={loginHref} className="text-text-muted hover:text-text">
                  Към страницата за вход
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-[12.5px] font-semibold text-text mb-1.5">За какъв изпит се подготвяш?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClass('7')}
                      aria-pressed={selectedClass === '7'}
                      className={`px-3 py-3 rounded-xl border text-left transition ${
                        selectedClass === '7'
                          ? 'border-primary bg-primary/[0.06] ring-2 ring-primary/15'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                      }`}
                    >
                      <div className="text-[13px] font-bold text-text">НВО</div>
                      <div className="text-[11.5px] text-text-muted leading-tight">7. клас</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedClass('12')}
                      aria-pressed={selectedClass === '12'}
                      className={`px-3 py-3 rounded-xl border text-left transition ${
                        selectedClass === '12'
                          ? 'border-primary bg-primary/[0.06] ring-2 ring-primary/15'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                      }`}
                    >
                      <div className="text-[13px] font-bold text-text">ДЗИ</div>
                      <div className="text-[11.5px] text-text-muted leading-tight">12. клас</div>
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имe (по избор)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Твоето име"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
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
                  <label className="block text-[12.5px] font-semibold text-text mb-1.5">Парола</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Минимум 8 знака"
                      className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E2E8F0] text-[14px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Скрий паролата' : 'Покажи паролата'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[40px] px-3 text-[12px] font-medium text-text-muted hover:text-text transition"
                    >
                      {showPassword ? 'Скрий' : 'Покажи'}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[12.5px] font-semibold text-text mb-1.5">Потвърди паролата</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Повтори паролата"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
                <div className="mb-5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <RegistrationConsentFields values={consents} onChange={updateConsent} idPrefix="register-page" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Създаване...' : 'Създай акаунт'}
                </button>
              </form>

              <p className="text-center text-[12.5px] text-text-muted mt-4">
                Вече имаш акаунт?{' '}
                <Link href={loginHref} className="text-primary font-semibold hover:underline">
                  Влез
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
