'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subjects } from '@/data/subjects'
import { FadeIn } from '@/components/ui/fade-in'

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

const tabs = [
  { key: 'nvo7' as const, label: '7. клас', sublabel: 'НВО', bg: '#2563EB', activeBg: '#2563EB' },
  { key: 'dzi12' as const, label: '12. клас', sublabel: 'ДЗИ', bg: '#111111', activeBg: '#111111' },
]

export function ExamsSection() {
  const [activeTab, setActiveTab] = useState<'nvo7' | 'dzi12'>('nvo7')
  const filtered = subjects.filter(s => s.examType === activeTab)

  return (
    <section id="izpiti" className="py-20 md:py-28 bg-white border-y border-[#E5E5E5]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <FadeIn className="mb-12">
          <p className="section-label mb-4">Изпити</p>
          <h2 className="text-[2rem] md:text-[2.8rem] font-extrabold text-[#0D0D0D] tracking-[-0.04em] leading-[1.05] max-w-2xl">
            Подготовка за НВО и ДЗИ
          </h2>
          <p className="text-[16px] text-[#6B6B6B] max-w-xl mt-4 leading-[1.7]">
            Избери своя изпит и виж всички предмети, теми и материали, достъпни в платформата.
          </p>
        </FadeIn>

        {/* Two bold flat-color tab blocks */}
        <div className="grid grid-cols-2 gap-0 mb-10 border border-[#E5E5E5] rounded-[8px] overflow-hidden">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative py-6 px-8 text-left transition-colors duration-200 group"
              style={{
                backgroundColor: activeTab === tab.key ? tab.bg : '#F5F5F5',
              }}
            >
              {activeTab !== tab.key && (
                <div className="absolute inset-0 hover:bg-[#EBEBEB] transition-colors duration-200" />
              )}
              <div className="relative">
                <div
                  className="text-[11px] font-bold tracking-[0.1em] uppercase mb-0.5"
                  style={{ color: activeTab === tab.key ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}
                >
                  {tab.label}
                </div>
                <div
                  className="text-[2rem] font-extrabold tracking-[-0.04em] leading-none"
                  style={{ color: activeTab === tab.key ? '#FFFFFF' : '#0D0D0D' }}
                >
                  {tab.sublabel}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Subject cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map(subject => {
              const meta = subjectMeta[subject.id]
              return (
                <div key={subject.id}
                  className="bg-white rounded-[8px] border border-[#E5E5E5] p-6 flex flex-col gap-4 hover:border-[#B0B0B0] hover:-translate-y-[3px] transition-all duration-200">

                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[6px] flex items-center justify-center flex-shrink-0 border"
                      style={{ backgroundColor: subject.color + '12', borderColor: subject.color + '30' }}
                    >
                      <span className="text-[11px] font-extrabold" style={{ color: subject.color }}>
                        {subject.code}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[#0D0D0D] text-[14px] leading-snug tracking-[-0.02em]">
                      {subject.name}
                    </h3>
                  </div>

                  {meta && (
                    <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{meta.description}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { label: 'Теми', value: subject.topicsCount },
                      { label: 'Тестове', value: subject.testsCount },
                      { label: 'Уроци', value: subject.lessonsCount },
                    ].map(stat => (
                      <div key={stat.label} className="text-center bg-[#FAF8F4] rounded-[6px] py-2.5 border border-[#E5E5E5]">
                        <p className="text-[15px] font-extrabold text-[#0D0D0D] tracking-[-0.02em]">{stat.value}</p>
                        <p className="text-[10.5px] text-[#6B6B6B] font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Format tags */}
                  {meta && (
                    <div className="flex flex-wrap gap-1.5">
                      {meta.formats.map(fmt => (
                        <span key={fmt}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-[4px] border"
                          style={{ color: subject.color, borderColor: subject.color + '40', backgroundColor: subject.color + '08' }}>
                          {fmt}
                        </span>
                      ))}
                    </div>
                  )}

                  <a href="/dashboard"
                    className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-bold transition-colors duration-150"
                    style={{ color: subject.color }}>
                    Виж подготовката
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        <FadeIn delay={0.2} className="mt-8">
          <a href="/dashboard" className="btn-primary px-6 py-2.5">Виж всички предмети</a>
        </FadeIn>
      </div>
    </section>
  )
}
