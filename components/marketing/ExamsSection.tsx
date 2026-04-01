'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subjects } from '@/data/subjects'
import { cn } from '@/lib/utils'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const subjectMeta: Record<string, { description: string; includes: string[]; formats: string[] }> = {
  'bg-lang-7': {
    description: 'Тестове по теми, кратки аудио уроци, материали за преговор и AI помощ.',
    includes: ['Правопис и пунктуация', 'Анализ на текст', 'Съчинение-разсъждение'],
    formats: ['Тест с избор', 'Анализ на текст', 'Пълен НВО формат'],
  },
  'math-7': {
    description: 'Задачи по теми с решения стъпка по стъпка, аудио обяснения и AI помощ при грешки.',
    includes: ['Алгебра и функции', 'Геометрия', 'Уравнения и неравенства'],
    formats: ['Тест с избор', 'Задачи с решение', 'Пълен НВО формат'],
  },
  'bg-lang-12': {
    description: 'Литературен анализ, изразни средства, интерпретативни съчинения и AI преговор.',
    includes: ['Художествени текстове', 'Стилистика', 'Интерпретативно съчинение'],
    formats: ['Тест с избор', 'Съчинение', 'Пълен ДЗИ формат'],
  },
  'math-12': {
    description: 'Алгебра, геометрия и вероятности — с решени примери, тестове и AI обяснения.',
    includes: ['Алгебра и анализ', 'Геометрия', 'Статистика и вероятности'],
    formats: ['Тест с избор', 'Задачи с решение', 'Пълен ДЗИ формат'],
  },
  'history-12': {
    description: 'Теми по световна и българска история с аудио уроци и тестове по периоди.',
    includes: ['Антична история', 'Нова история', 'История на България'],
    formats: ['Тест с избор', 'Есе', 'Пълен ДЗИ формат'],
  },
  'geography-12': {
    description: 'Физическа и икономическа география, екология и демография с тестове и уроци.',
    includes: ['Физическа география', 'Икономическа география', 'Демография'],
    formats: ['Тест с избор', 'Задачи', 'Пълен ДЗИ формат'],
  },
  'biology-12': {
    description: 'Клетъчна биология, генетика, екосистеми и здравно образование — с тестове и уроци.',
    includes: ['Клетъчна биология', 'Генетика', 'Екосистеми'],
    formats: ['Тест с избор', 'Задачи', 'Пълен ДЗИ формат'],
  },
  'chemistry-12': {
    description: 'Химични реакции, органична химия и опазване на околната среда с тестове.',
    includes: ['Неорганична химия', 'Органична химия', 'Екология'],
    formats: ['Тест с избор', 'Задачи', 'Пълен ДЗИ формат'],
  },
  'physics-12': {
    description: 'Механика, електричество, оптика и астрономия с задачи и аудио обяснения.',
    includes: ['Механика', 'Електродинамика', 'Оптика и астрономия'],
    formats: ['Тест с избор', 'Задачи с решение', 'Пълен ДЗИ формат'],
  },
}

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
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((subject) => {
              const meta = subjectMeta[subject.id]
              return (
                <div key={subject.id} className="card-hover p-6 flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subject.color + '14' }}
                    >
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: subject.color }}
                      >
                        {subject.code}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text text-[14px] leading-snug tracking-[-0.01em]">
                      {subject.name}
                    </h3>
                  </div>

                  {/* Description */}
                  {meta && (
                    <p className="text-[13px] text-text-muted leading-relaxed">
                      {meta.description}
                    </p>
                  )}

                  {/* Stats */}
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

                  {/* Formats */}
                  {meta && (
                    <div className="flex flex-wrap gap-1.5">
                      {meta.formats.map((fmt) => (
                        <span
                          key={fmt}
                          className="text-[11px] font-medium text-text-muted bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-full"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href="/dashboard"
                    className="mt-auto inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Виж подготовката
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              )
            })}
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
