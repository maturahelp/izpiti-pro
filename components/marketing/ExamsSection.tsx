'use client'

import { useState } from 'react'
import { subjects } from '@/data/subjects'
import { cn } from '@/lib/utils'

export function ExamsSection() {
  const [activeTab, setActiveTab] = useState<'nvo7' | 'dzi12'>('nvo7')

  const filtered = subjects.filter((s) => s.examType === activeTab)

  return (
    <section id="izpiti" className="py-16 md:py-24 bg-white border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="section-label mb-3">Изпити</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            Подготовка за НВО и ДЗИ
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Избери своя изпит и виж всички предмети, теми и материали, достъпни в платформата.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-bg border border-border p-1">
            {[
              { key: 'nvo7', label: '7. клас — НВО', sub: 'Национално вътрешно оценяване' },
              { key: 'dzi12', label: '12. клас — ДЗИ', sub: 'Държавен зрелостен изпит' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'nvo7' | 'dzi12')}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  activeTab === tab.key
                    ? 'bg-white text-text shadow-card border border-border'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((subject) => (
            <div key={subject.id} className="card-hover p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subject.color + '18' }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: subject.color }}
                    >
                      {subject.code}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text text-sm leading-snug">{subject.name}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'Теми', value: subject.topicsCount },
                  { label: 'Тестове', value: subject.testsCount },
                  { label: 'Уроци', value: subject.lessonsCount },
                ].map((stat) => (
                  <div key={stat.label} className="text-center bg-bg rounded-lg py-2">
                    <p className="text-base font-bold text-text font-serif">{stat.value}</p>
                    <p className="text-[11px] text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/dashboard" className="btn-primary">
            Виж всички предмети
          </a>
        </div>
      </div>
    </section>
  )
}
