'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { tests } from '@/data/tests'
import {
  generatedEnglishWritingQuestionCount,
} from '@/lib/english-generated-materials'
import { useGrade } from '@/lib/grade-context'
import { hasActivePremium } from '@/lib/subscription-access'
import { cn } from '@/lib/utils'

export type TestSection7 = 'bel' | 'math'
export type TestSection12 = 'bel' | 'english'
export type TestMode = 'sample' | 'past'

type TestsPageContentProps = {
  initialGrade: '7' | '12'
  initialSection7: TestSection7
  initialSection12: TestSection12
  initialMode: TestMode
}

const sectionLabels7: Record<TestSection7, string> = {
  bel: 'БЕЛ',
  math: 'Математика',
}

const sectionLabels12: Record<TestSection12, string> = {
  bel: 'БЕЛ',
  english: 'Английски',
}

type SubjectThemeColors = {
  accent: string
  accentHover: string
  soft: string
  softHover: string
  onSoft: string
}

const sectionTheme: Record<'bel' | 'math' | 'english', SubjectThemeColors> = {
  bel: {
    accent: '#8B5CF6',
    accentHover: '#6D3FE0',
    soft: '#F3EBFF',
    softHover: '#E4D4FA',
    onSoft: '#5B21B6',
  },
  math: {
    accent: '#16A34A',
    accentHover: '#15803D',
    soft: '#E8F8EE',
    softHover: '#D2EFDB',
    onSoft: '#166534',
  },
  english: {
    accent: '#DC2626',
    accentHover: '#B91C1C',
    soft: '#FFECEE',
    softHover: '#FBD9DD',
    onSoft: '#991B1B',
  },
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
  if (
    test.id.startsWith('mock_') ||
    test.id.startsWith('selected_mock_') ||
    test.id.startsWith('english-generated-') ||
    /^q\d+$/i.test(test.id)
  ) return 'sample'
  return 'past'
}

function getTestHref(test: (typeof tests)[number]): string {
  return `/dashboard/tests/${test.id}`
}

function usesSelectableQuestionLabel(test: (typeof tests)[number]) {
  return /^nvo-(bel|math)-\d{4}$/.test(test.id) || /^dzi-bel-\d{4}-(may|aug|june)$/.test(test.id)
}

function getQuestionCountLabel(test: (typeof tests)[number]) {
  return usesSelectableQuestionLabel(test)
    ? `${test.questionsCount} тестови`
    : `${test.questionsCount} въпроса`
}

export function TestsPageContent({
  initialGrade,
  initialSection7,
  initialSection12,
  initialMode,
}: TestsPageContentProps) {
  const { grade, lockedGrade } = useGrade()
  const [selectedSection7, setSelectedSection7] = useState<TestSection7>(initialSection7)
  const [selectedSection12, setSelectedSection12] = useState<TestSection12>(initialSection12)
  const [selectedMode, setSelectedMode] = useState<TestMode>(initialMode)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const effectiveGrade = lockedGrade ?? grade

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_active, plan_expires_at')
        .eq('id', user.id)
        .single()

      if (cancelled) return

      setIsPremiumUser(hasActivePremium(profile))
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const activeSectionKey: 'bel' | 'math' | 'english' =
    effectiveGrade === '7' ? selectedSection7 : selectedSection12
  const activeTheme = sectionTheme[activeSectionKey]
  const isEnglishSampleView =
    effectiveGrade === '12' && selectedSection12 === 'english' && selectedMode === 'sample'
  const isLocked = !isPremiumUser

  const filtered = tests.filter((test) => {
    if (effectiveGrade === '7') {
      if (test.examType !== 'nvo7') return false
      if (getTestSection(test) !== selectedSection7) return false
      if (getTestMode(test) !== selectedMode) return false
    } else {
      if (test.examType !== 'dzi12') return false
      if (getTestSection(test) !== selectedSection12) return false
      if (getTestMode(test) !== selectedMode) return false
    }

    return true
  })

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Тестове" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="mb-6 -mt-4 space-y-3">
          {effectiveGrade === '7' && (
            <div className="flex flex-wrap justify-center gap-3">
              {(Object.keys(sectionLabels7) as TestSection7[]).map((section) => {
                const theme = sectionTheme[section]
                const isActive = selectedSection7 === section

                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setSelectedSection7(section)}
                    style={
                      isActive
                        ? { backgroundColor: theme.accent, color: '#ffffff' }
                        : { backgroundColor: theme.soft, color: theme.onSoft }
                    }
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = isActive ? theme.accentHover : theme.softHover
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = isActive ? theme.accent : theme.soft
                    }}
                    className="inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors"
                  >
                    {sectionLabels7[section]}
                  </button>
                )
              })}
            </div>
          )}

          {effectiveGrade === '12' && (
            <div className="flex flex-wrap justify-center gap-3">
              {(Object.keys(sectionLabels12) as TestSection12[]).map((section) => {
                const theme = sectionTheme[section]
                const isActive = selectedSection12 === section

                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setSelectedSection12(section)}
                    style={
                      isActive
                        ? { backgroundColor: theme.accent, color: '#ffffff' }
                        : { backgroundColor: theme.soft, color: theme.onSoft }
                    }
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = isActive ? theme.accentHover : theme.softHover
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = isActive ? theme.accent : theme.soft
                    }}
                    className="inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors"
                  >
                    {sectionLabels12[section]}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-xl bg-gray-100 p-1">
              {(Object.keys(modeLabelsByGrade[effectiveGrade]) as TestMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors',
                    selectedMode === mode
                      ? 'bg-white shadow-sm'
                      : 'text-text-muted hover:text-text'
                  )}
                  style={selectedMode === mode ? { color: activeTheme.onSoft } : undefined}
                >
                  {modeLabelsByGrade[effectiveGrade][mode]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 md:p-5"
          style={{ backgroundColor: activeTheme.soft, borderColor: activeTheme.softHover }}
        >
          {!isEnglishSampleView && (
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{filtered.length}</strong> теста
            </p>
          )}

          {isEnglishSampleView && (
            <div className="mb-4">
              <div className="card-hover p-5 flex flex-col gap-4">
                <div>
                  <span
                    className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: activeTheme.softHover, color: activeTheme.onSoft }}
                  >
                    {generatedEnglishWritingQuestionCount} задачи
                  </span>
                  <h3 className="font-semibold text-text text-sm leading-snug">Writing банк</h3>
                  <p className="text-xs text-text-muted mt-1">Formal letters, opinion essays, stories и descriptions</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>Word limits</span>
                  <span>·</span>
                  <span>Checklists</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: activeTheme.softHover, color: activeTheme.onSoft }}
                  >
                    Writing
                  </span>
                  {isLocked ? (
                    <Link
                      href="/dashboard/subscription"
                      className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors bg-gray-100 text-text-muted hover:bg-gray-200"
                    >
                      Отключи с премиум
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/tests/english-generated-writing"
                      style={{ backgroundColor: activeTheme.accent }}
                      onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = activeTheme.accentHover }}
                      onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = activeTheme.accent }}
                      className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors text-white"
                    >
                      Отвори
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <div id={isEnglishSampleView ? 'english-generated-tests' : undefined} className="grid sm:grid-cols-2 gap-4">
            {filtered.map((test) => (
              <div key={test.id} className={cn('card-hover p-5 flex flex-col gap-4 relative', isLocked && 'premium-lock')}>
                {(() => {
                  const isMock =
                    test.id.startsWith('mock_') ||
                    test.id.startsWith('selected_mock_') ||
                    test.id.startsWith('english-generated-')
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
                {isLocked && <PremiumLock compact />}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: activeTheme.softHover, color: activeTheme.onSoft }}
                      >
                        {test.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                      </span>
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
                  <span>{getQuestionCountLabel(test)}</span>
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

                <div className="flex justify-end">
                  {isLocked ? (
                    <Link
                      href="/dashboard/subscription"
                      className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors bg-gray-100 text-text-muted hover:bg-gray-200"
                    >
                      Отключи с премиум
                    </Link>
                  ) : (
                    <Link
                      href={getTestHref(test)}
                      style={{ backgroundColor: activeTheme.accent }}
                      onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = activeTheme.accentHover }}
                      onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = activeTheme.accent }}
                      className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors text-white"
                    >
                      {test.status === 'completed' ? 'Повтори' : test.status === 'in_progress' ? 'Продължи' : 'Започни'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && !isEnglishSampleView && (
            <div className="text-center py-16 text-text-muted">
              <p className="font-medium mb-1">Няма намерени тестове</p>
              <p className="text-sm">Промени филтрите, за да видиш резултати.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
