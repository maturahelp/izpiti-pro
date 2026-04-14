'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Попълни всички полета.'); return }
    setLoading(true)
    const { user, error } = await signIn(email, password)
    setLoading(false)
    if (error || !user) {
      const msg = error?.message?.includes('Email not confirmed')
        ? 'Имейлът не е потвърден. Провери пощата си и кликни линка за потвърждение.'
        : error?.message || 'Грешен имейл или парола.'
      setError(msg)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] px-8 py-7">

          {/* Logo */}
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
            Влез в акаунта си
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-5">
            Продължи подготовката си за матурата
          </p>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имейл адрес</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Въведи своя имейл"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12.5px] font-semibold text-text">Парола</label>
                <Link href="/forgot-password" className="text-[12px] text-primary hover:underline">Забравена парола?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-14 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-muted hover:text-text transition"
                >
                  {showPassword ? 'Скрий' : 'Покажи'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Влизане...' : 'Влез'}
            </button>
          </form>

          <p className="text-center text-[12.5px] text-text-muted mt-4">
            Нямаш акаунт?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Регистрирай се
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
