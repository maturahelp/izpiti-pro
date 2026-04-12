'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { tests } from '@/data/tests'
import { getDifficultyColor } from '@/lib/utils'
import { useGrade } from '@/lib/grade-context'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type TestSection12 = 'bel' | 'english'
type TestSection7 = 'bel' | 'math'
type TestMode = 'sample' | 'past'

const sectionLabels12: Record<TestSection12, string> = {
  bel: 'БЕЛ',
  english: 'Английски',
}

const sectionLabels7: Record<TestSection7, string> = {
  bel: 'БЕЛ',
  math: 'Математика',
}

const modeLabelsByGrade: Record<'7' | '12', Record<TestMode, string>> = {
  '7': {
    sample: 'Примерен НВО',
    past: 'НВО от минали години',
  },
  '12': {
    sample: 'Примерен ДЗИ',
    past: 'ДЗИ от минали години',
  },
}

function getTestSection(test: (typeof tests)[number]): string {
  if (test.subjectId.startsWith('eng-') || test.subjectName.toLowerCase().includes('англий')) return 'english'
  if (test.subjectId.startsWith('math-') || test.subjectName.toLowerCase().includes('матем')) return 'math'
  return 'bel'
}

function getTestMode(test: (typeof tests)[number]): TestMode {
  if (test.id.startsWith('mock_') || test.id.startsWith('selected_mock_') || /^q\d+$/i.test(test.id)) return 'sample'
  return 'past'
}

export default function TestsPage() {
  const { grade } = useGrade()
  const [selectedSection12, setSelectedSection12] = useState<TestSection12>('bel')
  const [selectedSection7, setSelectedSection7] = useState<TestSection7>('bel')
  const [selectedMode, setSelectedMode] = useState<TestMode>('sample')

  const filtered = tests.filter((t) => {
    if (grade === '7') {
      if (t.examType !== 'nvo7') return false
      if (getTestSection(t) !== selectedSection7) return false
      if (getTestMode(t) !== selectedMode) return false
    } else {
      if (t.examType !== 'dzi12') return false
      if (getTestSection(t) !== selectedSection12) return false
      if (getTestMode(t) !== selectedMode) return false
    }
    return true
  })

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Тестове" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        {/* Filters */}
        <div className="mb-6 -mt-4 space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            {grade === '7'
              ? (Object.keys(sectionLabels7) as TestSection7[]).map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setSelectedSection7(section)}
                    className={cn(
                      'inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors',
                      selectedSection7 === section
                        ? 'bg-primary text-white'
                        : 'bg-primary-light text-primary hover:bg-primary-light/70'
                    )}
                  >
                    {sectionLabels7[section]}
                  </button>
                ))
              : (Object.keys(sectionLabels12) as TestSection12[]).map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setSelectedSection12(section)}
                    className={cn(
                      'inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors',
                      selectedSection12 === section
                        ? 'bg-primary text-white'
                        : 'bg-primary-light text-primary hover:bg-primary-light/70'
                    )}
                  >
                    {sectionLabels12[section]}
                  </button>
                ))
            }
          </div>

          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-xl bg-gray-100 p-1">
              {(Object.keys(modeLabelsByGrade[grade]) as TestMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors',
                    selectedMode === mode
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-text-muted hover:text-text'
                  )}
                >
                  {modeLabelsByGrade[grade][mode]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-text-muted mb-4">
          Намерени: <strong className="text-text">{filtered.length}</strong> теста
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((test) => (
            <div key={test.id} className={cn('card-hover p-5 flex flex-col gap-4 relative', test.isPremium && 'premium-lock')}>
              {(() => {
                const isMock = test.id.startsWith('mock_') || test.id.startsWith('selected_mock_')
                const isBeron = test.id.startsWith('beron_')

                if (isBeron) {
                  return (
                    <div className="absolute top-3 right-3">
                      <Badge variant="primary">BERON</Badge>
                    </div>
                  )
                }

                return isMock ? (
                  <div className="absolute top-3 right-3">
                    <Badge variant="neutral">Примерен</Badge>
                  </div>
                ) : null
              })()}
              {test.isPremium && <PremiumLock compact />}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant={test.examType === 'nvo7' ? 'primary' : 'amber'}>
                      {test.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                    </Badge>
                    {test.status === 'completed' && (
                      <Badge variant="success">Завършен</Badge>
                    )}
                    {test.status === 'in_progress' && (
                      <Badge variant="neutral">В процес</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-text text-sm leading-snug">{test.title}</h3>
                  <p className="text-xs text-text-muted mt-1">{test.subjectName} · {test.topicName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {test.timeMinutes} мин.
                </span>
                <span>{test.questionsCount} въпроса</span>
                <span>{test.completedCount.toLocaleString()} реш.</span>
                {test.status === 'completed' && test.lastScore && (
                  <span className={`ml-auto font-bold text-sm font-serif ${
                    test.lastScore >= 80 ? 'text-success' :
                    test.lastScore >= 60 ? 'text-amber' : 'text-danger'
                  }`}>
                    {test.lastScore}%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge text-xs ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </span>
                <Link
                  href={`/dashboard/tests/${test.id}`}
                  className={cn(
                    'text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors',
                    test.isPremium
                      ? 'bg-gray-100 text-text-muted cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  )}
                >
                  {test.status === 'completed' ? 'Повтори' : test.status === 'in_progress' ? 'Продължи' : 'Започни'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="font-medium mb-1">Няма намерени тестове</p>
            <p className="text-sm">Промени филтрите, за да видиш резултати.</p>
          </div>
        )}
      </div>
    </div>
  )
}
