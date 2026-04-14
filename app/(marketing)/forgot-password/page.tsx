'use client'

import Link from 'next/link'
import { useState } from 'react'
import { requestPasswordReset, updatePassword } from '@/lib/auth'

function hasRecoveryHash() {
  if (typeof window === 'undefined') {
    return false
  }

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash

  return new URLSearchParams(hash).get('type') === 'recovery'
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => hasRecoveryHash())
  const title = isRecoveryMode ? 'Задай нова парола' : 'Забравена парола'

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!email) {
      setError('Въведи имейл адреса си.')
      return
    }

    setLoading(true)
    const redirectTo = `${window.location.origin}/forgot-password`
    const { error } = await requestPasswordReset(email, redirectTo)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setInfo('Изпратихме ти имейл с линк за смяна на паролата.')
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!password || !confirmPassword) {
      setError('Попълни и двете полета за парола.')
      return
    }

    if (password.length < 8) {
      setError('Паролата трябва да е поне 8 знака.')
      return
    }

    if (password !== confirmPassword) {
      setError('Паролите не съвпадат.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)

    if (error) {
      setError('Линкът е невалиден или е изтекъл. Поискай нов имейл за възстановяване.')
      return
    }

    setInfo('Паролата е сменена успешно. Вече можеш да влезеш с новата парола.')
    setPassword('')
    setConfirmPassword('')
    setIsRecoveryMode(false)
    window.history.replaceState({}, '', '/forgot-password')
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
                <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#2F4E85" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#2F4E85" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#2F4E85" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#2F4E85" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-serif font-bold text-text text-[18px] tracking-[-0.02em]">MaturaHelp</span>
          </div>

          <h2 className="text-[19px] font-bold text-text text-center tracking-[-0.02em] mb-0.5">
            {title}
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-5">
            {isRecoveryMode
              ? 'Въведи новата си парола, за да завършиш възстановяването.'
              : 'Ще ти изпратим линк за смяна на паролата.'}
          </p>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[13px] text-blue-700">
              {info}
            </div>
          )}

          {isRecoveryMode ? (
            <form onSubmit={handleResetSubmit}>
              <div className="mb-3">
                <label className="block text-[12.5px] font-semibold text-text mb-1.5">Нова парола</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 8 знака"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-[12.5px] font-semibold text-text mb-1.5">Потвърди паролата</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повтори новата парола"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Запазване...' : 'Запази новата парола'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-5">
                <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имейл адрес</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Въведи своя имейл"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Изпращане...' : 'Изпрати линк'}
              </button>
            </form>
          )}

          <p className="text-center text-[12.5px] text-text-muted mt-4">
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Назад към входа
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
