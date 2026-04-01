'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subjects } from '@/data/subjects'
import { cn } from '@/lib/utils'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

export function ExamsSection() {
  const [activeTab, setActiveTab] = useState<'nvo7' | 'dzi12'>('nvo7')

  const filtered = subjects.filter((s) => s.examType === activeTab)

  return (
    <section id="izpiti" className="py-20 md:py-28 bg-white border-y border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Изпити</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Подготовка за НВО и ДЗИ
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Избери своя изпит и виж всички предмети, теми и материали, достъпни в платформата.
          </p>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.1} className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-1.5">
            {[
              { key: 'nvo7', label: '7. клас — НВО' },
              { key: 'dzi12', label: '12. клас — ДЗИ' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'nvo7' | 'dzi12')}
                className={cn(
                  'relative px-5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-200 tracking-[-0.01em]',
                  activeTab === tab.key
                    ? 'text-text'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]"
                    transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((subject) => (
              <div key={subject.id} className="card-hover p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subject.color + '14' }}
                  >
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: subject.color }}
                    >
                      {subject.code}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text text-[13.5px] leading-snug tracking-[-0.01em]">
                    {subject.name}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Теми', value: subject.topicsCount },
                    { label: 'Тестове', value: subject.testsCount },
                    { label: 'Уроци', value: subject.lessonsCount },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center bg-[#F8FAFC] rounded-xl py-2.5 border border-[#E2E8F0]/60">
                      <p className="text-[15px] font-bold text-text font-serif">{stat.value}</p>
                      <p className="text-[10.5px] text-text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <FadeIn delay={0.2} className="text-center mt-10">
          <a href="/dashboard" className="btn-primary px-6 py-2.5">
            Виж всички предмети
          </a>
        </FadeIn>
      </div>
    </section>
  )
}
