'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BackgroundPaths } from '@/components/ui/background-paths'

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

function MaturaLogo() {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/[0.08] border border-primary/15 flex items-center justify-center shadow-sm flex-shrink-0">
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

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease }}
      className="w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] px-8 py-6"
    >
      <MaturaLogo />

      <h2 className="text-[19px] font-bold text-text text-center tracking-[-0.02em] mb-0.5">
        Добре дошли обратно
      </h2>
      <p className="text-[13px] text-text-muted text-center mb-5">
        Влез в акаунта си, за да продължиш
      </p>

      {/* Email */}
      <div className="mb-3">
        <label className="block text-[12.5px] font-semibold text-text mb-1.5">
          Имейл адрес
        </label>
        <input
          type="email"
          placeholder="Въведи своя имейл"
          className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
        />
      </div>

      {/* Password */}
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
            placeholder="••••••••"
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

      {/* Sign In Button */}
      <Link
        href="/dashboard"
        className="block w-full text-center py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200"
      >
        Влез в акаунта
      </Link>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-[12px] text-text-muted/60">или продължи с</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-text transition">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-text transition">
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

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="login" className="relative bg-white border-b border-[#E2E8F0]/60 overflow-hidden">
      <BackgroundPaths />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-7 pt-12 pb-14 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* Left: Headline */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.07, ease }}
              className="text-[2.4rem] md:text-[3.2rem] font-serif font-bold text-text leading-[1.08] mb-6 text-balance tracking-[-0.03em]"
            >
              Всичко за НВО и ДЗИ на едно място –{' '}
              <span className="relative inline-flex justify-center" style={{ minWidth: '7ch' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    className="text-primary inline-block"
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
                className="btn-primary inline-block px-20 py-3.5 text-[16px] font-bold shadow-[0_4px_16px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_24px_rgba(27,79,216,0.4)] transition-shadow"
              >
                Започни
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease }}
              className="flex flex-wrap justify-center gap-2"
            >
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
            </motion.div>
          </div>

          {/* Right: Login Card */}
          <div className="flex justify-center lg:justify-end">
            <LoginCard />
          </div>

        </div>
      </div>
    </section>
  )
}
