'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { tests } from '@/data/tests'
import { useGrade } from '@/lib/grade-context'
import {
  generatedEnglishReadingQuestionCount,
  generatedEnglishWritingQuestionCount,
} from '@/lib/english-generated-materials'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type TestSection7 = 'bel' | 'math'
type TestSection12 = 'bel' | 'english'
type TestMode = 'sample' | 'past'

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
  if (test.subjectId === 'eng-12') {
    if (test.id.startsWith('english-generated-')) {
      return `/english-generated#${test.id.replace('english-generated-', '')}`
    }
    return `/english-mock/${test.id}`
  }
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

export default function TestsPage() {
  const { grade } = useGrade()
  const [selectedSection7, setSelectedSection7] = useState<TestSection7>('bel')
  const [selectedSection12, setSelectedSection12] = useState<TestSection12>('bel')
  const [selectedMode, setSelectedMode] = useState<TestMode>('sample')

  const activeSectionKey: 'bel' | 'math' | 'english' =
    grade === '7' ? selectedSection7 : selectedSection12
  const activeTheme = sectionTheme[activeSectionKey]

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
          {grade === '7' && (
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isActive ? theme.accentHover : theme.softHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isActive ? theme.accent : theme.soft
                    }}
                    className="inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors"
                  >
                    {sectionLabels7[section]}
                  </button>
                )
              })}
            </div>
          )}

          {grade === '12' && (
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isActive ? theme.accentHover : theme.softHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isActive ? theme.accent : theme.soft
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
              {(Object.keys(modeLabelsByGrade[grade]) as TestMode[]).map((mode) => (
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
                  {modeLabelsByGrade[grade][mode]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Themed section wrapper */}
        <div
          className="rounded-2xl border p-4 md:p-5"
          style={{ backgroundColor: activeTheme.soft, borderColor: activeTheme.softHover }}
        >

        {/* Results count */}
        {!(grade === '12' && selectedSection12 === 'english' && selectedMode === 'sample') && (
          <p className="text-sm text-text-muted mb-4">
            Намерени: <strong className="text-text">{filtered.length}</strong> теста
          </p>
        )}

        {/* English generated materials live under Примерен ДЗИ for 12th grade */}
        {grade === '12' && selectedSection12 === 'english' && selectedMode === 'sample' && (
          <div className="mb-4 grid sm:grid-cols-2 gap-4">
            <div className="card-hover p-5 flex flex-col gap-4">
              <div>
                <span
                  className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: activeTheme.softHover, color: activeTheme.onSoft }}
                >
                  {generatedEnglishReadingQuestionCount} въпроса
                </span>
                <h3 className="font-semibold text-text text-sm leading-snug">Reading Comprehension Bank</h3>
                <p className="text-xs text-text-muted mt-1">45 пълни reading теста с текст и по 10 ABCD въпроса</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span>45 текста за четене</span>
                <span>·</span>
                <span>ABCD формат</span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: activeTheme.softHover, color: activeTheme.onSoft }}
                >
                  Reading
                </span>
                <Link
                  href="/english-generated#reading"
                  style={{ backgroundColor: activeTheme.accent }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = activeTheme.accentHover }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activeTheme.accent }}
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors text-white"
                >
                  Отвори
                </Link>
              </div>
            </div>

            <div className="card-hover p-5 flex flex-col gap-4">
              <div>
                <span
                  className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: activeTheme.softHover, color: activeTheme.onSoft }}
                >
                  {generatedEnglishWritingQuestionCount} задачи
                </span>
                <h3 className="font-semibold text-text text-sm leading-snug">Writing Prompts Bank</h3>
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
                <Link
                  href="/english-generated#writing"
                  style={{ backgroundColor: activeTheme.accent }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = activeTheme.accentHover }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activeTheme.accent }}
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors text-white"
                >
                  Отвори
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((test) => (
            <div key={test.id} className={cn('card-hover p-5 flex flex-col gap-4 relative', test.isPremium && 'premium-lock')}>
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
              {test.isPremium && <PremiumLock compact />}

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
                <Link
                  href={getTestHref(test)}
                  style={
                    test.isPremium
                      ? undefined
                      : { backgroundColor: activeTheme.accent }
                  }
                  onMouseEnter={test.isPremium ? undefined : (e) => { e.currentTarget.style.backgroundColor = activeTheme.accentHover }}
                  onMouseLeave={test.isPremium ? undefined : (e) => { e.currentTarget.style.backgroundColor = activeTheme.accent }}
                  className={cn(
                    'text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors',
                    test.isPremium
                      ? 'bg-gray-100 text-text-muted cursor-not-allowed'
                      : 'text-white'
                  )}
                >
                  {test.status === 'completed' ? 'Повтори' : test.status === 'in_progress' ? 'Продължи' : 'Започни'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !(grade === '12' && selectedSection12 === 'english' && selectedMode === 'sample') && (
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
