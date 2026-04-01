'use client'

import Link from 'next/link'
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

          {/* Right: app preview */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-3xl" />
            <AppPreviewCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function AppPreviewCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] shadow-[0_24px_64px_rgba(15,23,42,0.12),0_4px_8px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.03)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]/70">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#1B4FD8" strokeWidth="1.8" strokeLinejoin="round" fill="white"/>
            <path d="M14 8V23" stroke="#1B4FD8" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold text-text tracking-[-0.01em]">MaturaHelp</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-success-light text-success text-[10px] font-semibold">Активен</span>
          <span className="text-[10px] text-text-muted">Мария П.</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Welcome */}
        <div>
          <p className="text-[10px] text-text-light mb-0.5 tracking-[0.02em] uppercase font-medium">Добре дошла,</p>
          <p className="text-[13px] font-bold text-text font-serif tracking-[-0.01em]">Мария Петрова</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Тестове', value: '8' },
            { label: 'Уроци', value: '5' },
            { label: 'Резултат', value: '72%' },
          ].map((s) => (
            <div key={s.label} className="bg-[#F8FAFC] rounded-xl p-2 text-center border border-[#E2E8F0]/60">
              <p className="text-base font-bold text-text font-serif">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div className="bg-primary/[0.07] rounded-xl p-3 flex items-center justify-between border border-primary/10">
          <div>
            <p className="text-[10px] font-semibold text-primary mb-0.5 tracking-[0.01em]">Продължи урока</p>
            <p className="text-[11px] font-semibold text-text tracking-[-0.01em]">Запетая при сложно изречение</p>
            <p className="text-[10px] text-text-muted mt-0.5">БЕЛ — 45% завършен</p>
          </div>
          <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_1px_4px_rgba(27,79,216,0.3)]">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-text-muted mb-1.5">
            <span>Напредък в темата</span>
            <span className="font-semibold text-text">45%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-1 bg-primary rounded-full" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Test card */}
        <div className="border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[9.5px] font-semibold text-text-light uppercase tracking-[0.06em] mb-0.5">Следващ тест</p>
            <p className="text-[11px] font-semibold text-text tracking-[-0.01em]">Части на речта — тест 2</p>
            <p className="text-[10px] text-text-muted">25 въпроса · 40 мин</p>
          </div>
          <span className="text-[10px] font-semibold text-amber bg-amber-light px-2 py-1 rounded-full">Среден</span>
        </div>

        {/* AI helper */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 flex items-center gap-3 border border-[#E2E8F0]/60">
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#1B4FD8"/>
            </svg>
          </div>
          <p className="text-[10px] text-text-muted">
            <span className="text-text font-semibold">AI помощник</span> — задай въпрос по темата
          </p>
        </div>
      </div>
    </div>
  )
}
