'use client'

import { TopBar } from '@/components/dashboard/TopBar'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useGrade } from '@/lib/grade-context'

type TablesSection = 'bulgarian' | 'literature' | 'math' | 'english'

const sectionLabels: Record<TablesSection, string> = {
  bulgarian: 'Български',
  literature: 'Литература',
  math: 'Математика',
  english: 'Английски',
}

export default function TablesCardsPage() {
  const { grade } = useGrade()
  const [selectedSection, setSelectedSection] = useState<TablesSection>('bulgarian')

  if (grade === '7') {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Таблици и карти" />
        <div className="flex flex-col items-center justify-center py-24 text-center text-text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-30">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          <p className="font-semibold text-base mb-1">Таблиците и картите за 7. клас</p>
          <p className="text-sm">скоро ще бъдат добавени</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Таблици и карти" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        <div className="mb-2">
          <div className="flex flex-wrap justify-center gap-3">
            {(Object.keys(sectionLabels) as TablesSection[]).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setSelectedSection(section)}
                className={cn(
                  'inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors',
                  selectedSection === section
                    ? 'bg-primary text-white'
                    : 'bg-primary-light text-primary hover:bg-primary-light/70'
                )}
              >
                {sectionLabels[section]}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-text mb-2">Секция „Таблици и карти“</h2>
          <p className="text-sm text-text-muted">
            Тук ще добавим таблици и учебни карти. Кажи ми как искаш да изглежда първият блок и го правя веднага.
          </p>
        </div>
      </div>
    </div>
  )
}
