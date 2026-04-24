'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signUp, signIn } from '@/lib/auth'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { buildRegistrationConsentMetadata, getBrowserUserAgent } from '@/lib/legal-consent'
import { RegistrationConsentFields, type RegistrationConsentValues } from '@/components/shared/LegalConsentFields'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [consents, setConsents] = useState<RegistrationConsentValues>({
    acceptedTermsPrivacy: false,
    confirmedAge14: false,
    marketingEmails: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState(false)

  function updateConsent(key: keyof RegistrationConsentValues, checked: boolean) {
    setConsents((current) => ({ ...current, [key]: checked }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
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
    const { session, error } = await signUp(email, password, name, consentMetadata)
    if (error) { setLoading(false); setError(error.message); return }
    if (session) {
      window.location.href = '/dashboard/materials'
      return
    }
    // Email confirmation is enabled — try signing in anyway (works if confirmation is optional)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      // Confirmation required — show the check-your-email screen
      setConfirmation(true)
      return
    }
    window.location.href = '/dashboard/materials'
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
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <p className="text-[15px] font-semibold text-text">Провери имейла си</p>
              <p className="text-[13px] text-text-muted">Изпратихме линк за потвърждение на <strong>{email}</strong>. Кликни го, за да активираш акаунта си.</p>
              <Link href="/login" className="inline-block mt-2 text-[13px] text-primary font-semibold hover:underline">Към страницата за вход</Link>
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
                <Link href="/login" className="text-primary font-semibold hover:underline">
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
