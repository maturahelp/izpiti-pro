'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BackgroundPaths } from '@/components/ui/background-paths'

const badges = [
  'Безплатен старт',
  'НВО и ДЗИ',
  'AI помощник',
  'Без инсталация',
]

const rotatingPhrases = [
  'без хаос',
  'без лутане',
  'с ясен план',
]

const ease = [0.21, 0.47, 0.32, 0.98] as const

export function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % rotatingPhrases.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative bg-white border-b border-[#E2E8F0]/60 overflow-hidden">
      <BackgroundPaths />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-7 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left: text */}
          <div className="w-full">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.07, ease }}
              className="text-[2.75rem] md:text-[3.375rem] font-serif font-bold text-text leading-[1.1] mb-5 text-balance tracking-[-0.03em]"
            >
              Подготви се за НВО и ДЗИ{' '}
              <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: '6ch' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIndex}
                    className="text-primary inline-block"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.38, ease: [0.21, 0.47, 0.32, 0.98] }}
                  >
                    {rotatingPhrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.13, ease }}
              className="text-[17px] text-text-muted leading-[1.65] mb-9 tracking-[-0.005em]"
            >
              Тестове, аудио уроци, учебни материали и AI помощник на едно място.
              Подредена подготовка за 7. и 12. клас — без скъпи частни уроци.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.19, ease }}
              className="w-full text-center space-y-6"
            >
              <Link href="/dashboard" className="btn-primary px-12 py-5 text-[18px] font-bold inline-block">
                Започни безплатно
              </Link>

              <div className="flex flex-wrap justify-center gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-success flex-shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: login form */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-3xl" />
            <LoginCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function LoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', email.split('@')[0])
    }
    router.push('/dashboard')
  }

  const handleGoogle = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', 'Потребител')
    }
    router.push('/dashboard')
  }

  return (
    <div className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_24px_64px_rgba(15,23,42,0.12),0_4px_8px_rgba(15,23,42,0.04)] p-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#1B4FD8" strokeWidth="1.6" strokeLinejoin="round" fill="white"/>
          <path d="M14 8V23" stroke="#1B4FD8" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="font-bold text-text text-base tracking-tight font-serif">ИзпитиПро</span>
      </div>

      <h2 className="text-xl font-bold font-serif text-text mb-1 tracking-tight">Добре дошъл</h2>
      <p className="text-sm text-text-muted mb-6">Влез в акаунта си, за да продължиш</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Парола"
          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button
          type="submit"
          disabled={!email.trim()}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(27,79,216,0.25)]"
        >
          Вход
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-text-muted text-xs">или</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-text font-medium text-sm rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Вход с Google
      </button>

      <p className="text-center text-sm text-text-muted mt-6">
        Нямаш акаунт?{' '}
        <a href="#" className="text-primary hover:underline font-medium">Регистрация</a>
      </p>
    </div>
  )
}
