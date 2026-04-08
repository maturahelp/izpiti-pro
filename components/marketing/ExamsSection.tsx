'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subjects } from '@/data/subjects'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/ui/fade-in'

type SectionSubject = {
  id: string
  name: string
  code: string
  color: string
  topicsCount: number
  testsCount: number
  lessonsCount: number
}

const nvoSubjects: SectionSubject[] = subjects
  .filter((s) => s.examType === 'nvo7')
  .map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    color: s.color,
    topicsCount: s.topicsCount,
    testsCount: s.testsCount,
    lessonsCount: s.lessonsCount,
  }))

const dziSubjects: SectionSubject[] = [
  {
    id: 'bg-lang-12',
    name: 'Български език и литература',
    code: 'БЕЛ',
    color: '#7AAEE0',
    topicsCount: 22,
    testsCount: 48,
    lessonsCount: 66,
  },
  {
    id: 'math-12',
    name: 'Математика',
    code: 'МАТ',
    color: '#D97706',
    topicsCount: 24,
    testsCount: 48,
    lessonsCount: 72,
  },
  {
    id: 'english-12',
    name: 'Английски език',
    code: 'АНГ',
    color: '#2563EB',
    topicsCount: 20,
    testsCount: 40,
    lessonsCount: 58,
  },
]

const subjectMeta: Record<string, { description: string; formats: string[] }> = {
  'bg-lang-7': {
    description: 'Правопис, анализ на текст и писане по формат НВО с тестове и уроци по теми.',
    formats: ['Тест с избор', 'Анализ на текст', 'Пълен НВО формат'],
  },
  'math-7': {
    description: 'Задачи с решение стъпка по стъпка и тренировки по модела на НВО.',
    formats: ['Тест с избор', 'Задачи с решение', 'Пълен НВО формат'],
  },
  'bg-lang-12': {
    description: 'Литературен анализ, съчинения и езикова подготовка за формата на ДЗИ.',
    formats: ['Тест с избор', 'Съчинение', 'Пълен ДЗИ формат'],
  },
  'math-12': {
    description: 'Алгебра, геометрия и вероятности с последователни упражнения за ДЗИ.',
    formats: ['Тест с избор', 'Задачи с решение', 'Пълен ДЗИ формат'],
  },
  'english-12': {
    description: 'Граматика, четене и писане с примерни формати по модела на ДЗИ.',
    formats: ['Тест с избор', 'Текстови задачи', 'Пълен ДЗИ формат'],
  },
}

export function ExamsSection() {
  const [activeTab, setActiveTab] = useState<'nvo7' | 'dzi12'>('nvo7')
  const filtered = activeTab === 'nvo7' ? nvoSubjects : dziSubjects

  return (
    <section id="izpiti" className="py-20 md:py-28 bg-white border-y border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Изпити</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            НВО и ДЗИ
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Избери изпит и прегледай достъпните предмети, теми и формати за подготовка.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex justify-center mb-10">
          <div className="inline-flex bg-[#F8FAFC] border border-[#E2E8F0] p-1.5">
            {[
              { key: 'nvo7', label: '7. клас - НВО' },
              { key: 'dzi12', label: '12. клас - ДЗИ' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'nvo7' | 'dzi12')}
                className={cn(
                  'relative px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-200 tracking-[-0.01em]',
                  activeTab === tab.key
                    ? 'text-text'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-white border border-[#E2E8F0]"
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
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center"
          >
            {filtered.map((subject) => {
              const meta = subjectMeta[subject.id]
              return (
                <div key={subject.id} className="card-hover p-6 flex flex-col gap-4 w-full max-w-[360px]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 border border-[#E2E8F0]"
                      style={{ backgroundColor: subject.color + '14' }}
                    >
                      <span className="text-[11px] font-bold" style={{ color: subject.color }}>
                        {subject.code}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text text-[14px] leading-snug tracking-[-0.01em]">
                      {subject.name}
                    </h3>
                  </div>

                  {meta && (
                    <p className="text-[13px] text-text-muted leading-relaxed">
                      {meta.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Теми', value: subject.topicsCount },
                      { label: 'Тестове', value: subject.testsCount },
                      { label: 'Уроци', value: subject.lessonsCount },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center bg-[#F8FAFC] py-2.5 border border-[#E2E8F0]/60">
                        <p className="text-[15px] font-bold text-text font-serif">{stat.value}</p>
                        <p className="text-[10.5px] text-text-muted">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {meta && (
                    <div className="flex flex-wrap gap-1.5">
                      {meta.formats.map((fmt) => (
                        <span
                          key={fmt}
                          className="text-[11px] font-medium text-text-muted bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  )}

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
