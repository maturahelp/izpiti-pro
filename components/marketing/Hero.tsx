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

const ease = [0.21, 0.47, 0.32, 0.98] as const

function buildNextExamDate(month: number, day: number, hour = 8, minute = 0) {
  const now = new Date()
  const target = new Date(now.getFullYear(), month - 1, day, hour, minute, 0)

  if (target.getTime() <= now.getTime()) {
    target.setFullYear(now.getFullYear() + 1)
  }

  return target
}

const NVO_TARGET = buildNextExamDate(6, 18)
const DZI_TARGET = buildNextExamDate(5, 20)

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function MaturaLogo() {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/[0.08] border border-primary/15 flex items-center justify-center flex-shrink-0">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#1B4FD8" strokeWidth="1.6" strokeLinejoin="round" fill="white"/>
          <path d="M14 8V23" stroke="#1B4FD8" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="font-serif font-bold text-text text-[18px] tracking-[-0.02em]">MaturaHelp</span>
    </div>
  )
}

function ExamTimer({ label, target }: { label: string; target: Date }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target))
    }, 1000)

    return () => clearInterval(interval)
  }, [target])

  return (
    <div className="w-full border border-[#E2E8F0] bg-white px-4 py-3">
      <p className="text-[12px] font-semibold text-text mb-2">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: 'дни', value: timeLeft.days },
          { key: 'часа', value: timeLeft.hours },
          { key: 'минути', value: timeLeft.minutes },
          { key: 'сек.', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.key} className="border border-[#E2E8F0] bg-[#F8FAFC] py-2 text-center">
            <p className="text-[16px] font-bold text-text leading-none">{pad(item.value)}</p>
            <p className="text-[10px] text-text-muted mt-1">{item.key}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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

  function handleSocial() {
    // TODO: OAuth
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease }}
      className="w-full max-w-[430px] px-1 py-2"
    >
      <MaturaLogo />

      <h2 className="text-[19px] font-bold text-text text-center tracking-[-0.02em] mb-0.5">
        Добре дошли обратно
      </h2>
      <p className="text-[13px] text-text-muted text-center mb-5">
        Влез в акаунта си, за да продължиш
      </p>

      {error && (
        <div className="mb-3 px-4 py-2.5 border border-red-200 bg-red-50 text-[13px] text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-[12.5px] font-semibold text-text mb-1.5">
            Имейл адрес
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Въведи своя имейл"
            className="w-full px-4 py-2.5 border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12.5px] font-semibold text-text">Парола</label>
            <Link href="/forgot-password" className="text-[12px] text-primary hover:underline">
              Забравена парола?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-14 border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
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
          disabled={!email.trim() || loading}
          className="w-full py-3 font-semibold text-[14px] text-white bg-primary hover:bg-primary-dark transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Влизане...' : 'Влез в акаунта'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-[12px] text-text-muted/60">или продължи с</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={handleSocial} className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-text transition">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button onClick={handleSocial} className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-text transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>

      <p className="text-center text-[12.5px] text-text-muted">
        Нямаш акаунт?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Регистрирай се
        </Link>
      </p>
    </motion.div>
  )
}

function StatIcon({ type }: { type: 'tests' | 'lessons' | 'score' }) {
  if (type === 'tests') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mx-auto mb-1">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    )
  }

  if (type === 'lessons') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mx-auto mb-1">
        <path d="M4 19V5l8-2 8 2v14l-8 2-8-2Z" />
        <path d="M12 7v10" />
      </svg>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mx-auto mb-1">
      <path d="M12 2 15 9l7 .6-5.2 4.6L18.4 21 12 17.4 5.6 21l1.6-6.8L2 9.6 9 9l3-7Z" />
    </svg>
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease }}
      className="w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] px-8 py-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[12px] text-text-muted mb-0.5">Добре дошъл обратно</p>
          <h2 className="text-[18px] font-bold text-text tracking-[-0.02em]">{firstName}</h2>
        </div>
        <Link href="/dashboard"
          className="text-[12.5px] font-semibold text-primary hover:underline flex items-center gap-1">
          Табло
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Тестове', value: completedTests.length, icon: 'tests' as const },
          { label: 'Уроци', value: completedLessons.length, icon: 'lessons' as const },
          { label: 'Среден %', value: avgScore, icon: 'score' as const },
        ].map(s => (
          <div key={s.label} className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
            <StatIcon type={s.icon} />
            <div className="text-[20px] font-bold text-text tracking-[-0.02em]">{s.value}</div>
            <div className="text-[11px] text-text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12.5px] font-semibold text-text">Общ напредък</span>
          <span className="text-[12px] text-primary font-semibold">{avgScore}%</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${avgScore}%` }} />
        </div>
      </div>

      {inProgressTests.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-2">Продължи откъдето спря</p>
          <div className="space-y-2">
            {inProgressTests.slice(0, 2).map(t => (
              <Link key={t.id} href={`/dashboard/tests/${t.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] hover:border-primary/30 hover:bg-primary/[0.03] transition-all group">
                <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4"/><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-text truncate">{t.title}</p>
                  <p className="text-[11px] text-text-muted">{t.subjectName}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-muted group-hover:text-primary flex-shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
      setWordIndex((i) => (i + 1) % rotatingWords.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="login" className="relative bg-white border-b border-[#E2E8F0]/60 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-5 sm:px-7 pt-12 pb-14 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.07, ease }}
              className="text-[1.55rem] sm:text-[2rem] md:text-[3.2rem] font-serif font-bold text-text leading-[1.08] mb-6 tracking-[-0.03em]"
            >
              <span className="block">Всичко за НВО</span>
              <span className="block">и ДЗИ на едно място -</span>
              <span className="relative block h-[1.2em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    className="text-primary inline-block whitespace-nowrap"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.13, ease }}
              className="mb-6 flex justify-center"
            >
              <Link
                href="#ceni"
                className="btn-primary inline-block px-20 py-3.5 text-[16px] font-bold"
              >
                Започни
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease }}
              className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto"
            >
              <ExamTimer label="до НВО (7. клас)" target={NVO_TARGET} />
              <ExamTimer label="до ДЗИ (12. клас)" target={DZI_TARGET} />
            </motion.div>
          </div>

          <div className="flex justify-center lg:justify-end">
            {loggedInUser
              ? <ProgressCard userName={loggedInUser} />
              : <LoginCard onLogin={name => setLoggedInUser(name)} />}
          </div>
        </div>
      </div>
    </section>
  )
}
