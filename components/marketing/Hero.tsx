'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getUser } from '@/lib/auth'
import { tests } from '@/data/tests'
import { lessons } from '@/data/lessons'

const rotatingWords = [
  'тестове',
  'аудио уроци',
  'упражнения',
  'AI помощник',
  'записки',
  'таблици',
]

const badges = [
  'Безплатен старт',
  'НВО и ДЗИ',
  'AI помощник',
  'Без инсталация',
]

const ease = [0.21, 0.47, 0.32, 0.98] as const

function LoginCard({ onLogin }: { onLogin: (name: string) => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true); setError(null)
    const { user, error } = await signIn(email, password)
    setLoading(false)
    if (error || !user) {
      const msg = error?.message?.includes('Email not confirmed')
        ? 'Имейлът не е потвърден. Провери пощата си.'
        : 'Грешен имейл или парола.'
      setError(msg)
      return
    }
    const name = user.user_metadata?.name || email.split('@')[0]
    onLogin(name)
    router.push('/dashboard')
    router.refresh()
  }

  function handleSocial() { /* TODO: OAuth */ }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease }}
      className="w-full bg-white rounded-[8px] border border-[#E5E5E5] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] px-7 py-6"
    >
      {/* Logo in card */}
      <div className="flex items-center gap-2 justify-center mb-5">
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#2563EB" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
          <path d="M14 8V23" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 11C9.5 10.7 11 10.6 12.5 10.8" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M8 13.5C9.5 13.2 11 13.1 12.5 13.3" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 10.8C17 10.6 18.5 10.7 20 11" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 13.3C17 13.1 18.5 13.2 20 13.5" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="font-extrabold text-[#0D0D0D] text-[16px] tracking-[-0.03em]">MaturaHelp</span>
      </div>

      <h2 className="text-[18px] font-extrabold text-[#0D0D0D] text-center tracking-[-0.03em] mb-0.5">
        Добре дошли обратно
      </h2>
      <p className="text-[13px] text-[#6B6B6B] text-center mb-5">
        Влез в акаунта си, за да продължиш
      </p>

      {error && (
        <div className="mb-3 px-4 py-2.5 rounded-[6px] bg-red-50 border border-red-200 text-[13px] text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-[12px] font-bold text-[#0D0D0D] mb-1.5 tracking-[0.02em] uppercase">
            Имейл адрес
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Въведи своя имейл"
            className="input-field"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-bold text-[#0D0D0D] tracking-[0.02em] uppercase">Парола</label>
            <Link href="/forgot-password" className="text-[12px] text-[#2563EB] hover:underline">
              Забравена парола?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pr-14"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6B6B6B] hover:text-[#0D0D0D] font-medium transition"
            >
              {showPassword ? 'Скрий' : 'Покажи'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!email.trim() || loading}
          className="w-full py-3 rounded-[4px] font-bold text-[14px] text-white bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Влизане...' : 'Влез в акаунта'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#E5E5E5]" />
        <span className="text-[12px] text-[#9CA3AF]">или продължи с</span>
        <div className="flex-1 h-px bg-[#E5E5E5]" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button onClick={handleSocial} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[4px] border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[13px] font-medium text-[#0D0D0D] transition-colors duration-150">
          <svg width="15" height="15" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button onClick={handleSocial} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[4px] border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[13px] font-medium text-[#0D0D0D] transition-colors duration-150">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>

      <p className="text-center text-[12.5px] text-[#6B6B6B]">
        Нямаш акаунт?{' '}
        <Link href="/register" className="text-[#2563EB] font-bold hover:underline">
          Регистрирай се
        </Link>
      </p>
    </motion.div>
  )
}

function ProgressCard({ userName }: { userName: string }) {
  const firstName = userName.split(' ')[0] || 'Ученик'
  const completedTests = tests.filter(t => t.status === 'completed')
  const completedLessons = lessons.filter(l => l.status === 'completed')
  const avgScore = completedTests.length
    ? Math.round(completedTests.reduce((s, t) => s + (t.lastScore ?? t.avgScore), 0) / completedTests.length)
    : 0
  const inProgressTests = tests.filter(t => t.status === 'in_progress')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease }}
      className="w-full bg-white rounded-[8px] border border-[#E5E5E5] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] px-7 py-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] text-[#6B6B6B] mb-0.5 font-medium uppercase tracking-[0.06em]">Добре дошъл обратно</p>
          <h2 className="text-[18px] font-extrabold text-[#0D0D0D] tracking-[-0.03em]">{firstName} 👋</h2>
        </div>
        <Link href="/dashboard" className="text-[12.5px] font-bold text-[#2563EB] hover:underline flex items-center gap-1">
          Табло
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: 'Тестове', value: completedTests.length, icon: '📝' },
          { label: 'Уроци', value: completedLessons.length, icon: '🎧' },
          { label: 'Среден %', value: avgScore, icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="bg-[#FAF8F4] rounded-[6px] p-3 text-center border border-[#E5E5E5]">
            <div className="text-[16px] mb-1">{s.icon}</div>
            <div className="text-[20px] font-extrabold text-[#0D0D0D] tracking-[-0.03em]">{s.value}</div>
            <div className="text-[11px] text-[#6B6B6B] font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-bold text-[#0D0D0D] uppercase tracking-[0.04em]">Общ напредък</span>
          <span className="text-[12px] text-[#2563EB] font-bold">{avgScore}%</span>
        </div>
        <div className="h-2 bg-[#E5E5E5] rounded-[2px] overflow-hidden">
          <div className="h-full bg-[#2563EB] rounded-[2px] transition-all duration-700"
            style={{ width: `${avgScore}%` }} />
        </div>
      </div>

      {inProgressTests.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-[0.08em] mb-2">Продължи откъдето спря</p>
          <div className="space-y-2">
            {inProgressTests.slice(0, 2).map(t => (
              <Link key={t.id} href={`/dashboard/tests/${t.id}`}
                className="flex items-center gap-3 p-3 rounded-[6px] border border-[#E5E5E5] hover:border-[#B0B0B0] transition-colors group">
                <div className="w-7 h-7 rounded-[4px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 border border-[#BFDBFE]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4"/><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-[#0D0D0D] truncate">{t.title}</p>
                  <p className="text-[11px] text-[#6B6B6B]">{t.subjectName}</p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#9CA3AF] group-hover:text-[#2563EB] flex-shrink-0 transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || null
        setLoggedInUser(name)
      }
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex(i => (i + 1) % rotatingWords.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="login" className="relative bg-[#0F172A] border-b border-[#1E293B] overflow-hidden">

      {/* Subtle line grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.04,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-10">

          {/* Left: Headline */}
          <div className="flex flex-col justify-center">

            {/* Sharp rectangular badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease }}
              className="mb-7"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm text-white/80 text-[11px] font-bold tracking-[0.1em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Платформа за НВО и ДЗИ
              </span>
            </motion.div>

            {/* Massive headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="text-[3.2rem] sm:text-[4rem] md:text-[5rem] font-extrabold text-white leading-[1.0] tracking-[-0.04em] mb-7"
            >
              Всичко за{' '}
              <span className="text-[#2563EB]">НВО</span>
              {' '}и{' '}
              <span className="text-[#2563EB]">ДЗИ</span>
              <br />
              на едно място —{' '}
              <br className="hidden sm:block" />
              <span className="relative inline-flex" style={{ minWidth: '5ch' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    className="inline-block"
                    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.5)', color: 'transparent' }}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease }}
              className="mb-6"
            >
              <Link
                href="#ceni"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white font-bold text-[15px] rounded-full hover:bg-[#1d4ed8] transition-colors duration-150 tracking-[-0.01em] shadow-[0_4px_20px_rgba(37,99,235,0.4)]"
              >
                Започни
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </motion.div>

            {/* Small rectangular tags */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28, ease }}
              className="flex flex-wrap gap-2"
            >
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-white/70 border border-white/15 bg-white/[0.06] px-3.5 py-1.5 rounded-full tracking-[-0.01em]"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" className="flex-shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Card — slightly lower on desktop for visual interest */}
          <div className="flex justify-center lg:justify-end lg:pt-8">
            {loggedInUser
              ? <ProgressCard userName={loggedInUser} />
              : <LoginCard onLogin={name => setLoggedInUser(name)} />}
          </div>

        </div>
      </div>
    </section>
  )
}
