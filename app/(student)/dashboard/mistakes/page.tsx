'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MistakeAttempt {
  date: string
  answer: string
  correct: boolean
}

interface MistakeEntry {
  id: string
  examId: string
  examYear: number | string
  examSubject: string
  questionNumber: number
  questionText: string
  options: Record<string, string>
  correctOption: string
  questionImage: string | null
  userAnswer: string
  errorType: 'conceptual' | 'careless' | 'calculation' | null
  topics: string[]
  firstSeen: string
  lastSeen: string
  attempts: MistakeAttempt[]
  mastered: boolean
}

const MISTAKES_KEY = 'nvo_mistakes'
const ERROR_TYPE_LABELS: Record<string, string> = {
  conceptual: 'Концептуална',
  careless: 'Невнимание',
  calculation: 'Изчислителна',
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadMistakes(): MistakeEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(MISTAKES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveMistakes(entries: MistakeEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MISTAKES_KEY, JSON.stringify(entries))
}

function updateEntry(id: string, patch: Partial<MistakeEntry>) {
  const entries = loadMistakes()
  const idx = entries.findIndex((e) => e.id === id)
  if (idx === -1) return
  entries[idx] = { ...entries[idx], ...patch }
  saveMistakes(entries)
}

function recordRetryAttempt(id: string, answer: string): boolean {
  const entries = loadMistakes()
  const entry = entries.find((e) => e.id === id)
  if (!entry) return false

  const correct = answer === entry.correctOption
  entry.attempts.push({ date: new Date().toISOString(), answer, correct })

  if (correct) {
    const last = entry.attempts.slice(-2)
    entry.mastered = last.length === 2 && last.every((a) => a.correct)
  } else {
    entry.mastered = false
  }

  saveMistakes(entries)
  return correct
}

function getWeeklySet(entries: MistakeEntry[]): MistakeEntry[] {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  return entries.filter((e) => !e.mastered && e.lastSeen >= cutoff).slice(0, 15)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Retry question card
// ---------------------------------------------------------------------------
function RetryCard({ entry, onAttempt }: { entry: MistakeEntry; onAttempt: () => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [locked, setLocked] = useState(false)

  const handleOptionClick = (label: string) => {
    if (locked) return

    const correct = recordRetryAttempt(entry.id, label)
    setSelectedAnswer(label)
    setIsCorrect(correct)
    if (correct) setLocked(true)
    onAttempt()
  }

  return (
    <div className={cn('card p-4 space-y-3', isCorrect === true && 'border-green-300', isCorrect === false && 'border-red-200')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide font-mono">
          {entry.examYear} · {entry.examSubject} · Въпрос {entry.questionNumber}
        </span>
        {locked && (
          <span className="badge bg-success-light text-success text-xs">Усвоен ✓</span>
        )}
      </div>

      <p className="text-sm text-text leading-relaxed">{entry.questionText}</p>

      <div className="space-y-2">
        {Object.entries(entry.options).map(([label, text]) => {
          const isSelected = selectedAnswer === label
          const isThisCorrect = label === entry.correctOption

          let pillClass = 'w-full text-left flex items-start gap-3 p-3 rounded-xl border text-sm transition-colors'
          if (selectedAnswer !== null) {
            if (isThisCorrect) pillClass += ' border-green-300 bg-green-50 text-green-800'
            else if (isSelected && !isThisCorrect) pillClass += ' border-red-300 bg-red-50 text-red-700'
            else pillClass += ' border-border bg-surface text-text-muted opacity-60'
          } else {
            pillClass += ' border-border bg-surface hover:border-primary hover:bg-primary-light cursor-pointer'
          }

          return (
            <button
              key={label}
              type="button"
              disabled={locked}
              onClick={() => handleOptionClick(label)}
              className={pillClass}
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold grid place-items-center">
                {label}
              </span>
              <span className="leading-relaxed">{text || 'Избор по изображение'}</span>
            </button>
          )
        })}
      </div>

      {selectedAnswer !== null && (
        <p className={cn('text-xs font-medium px-3 py-2 rounded-lg', isCorrect ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50')}>
          {isCorrect
            ? `Верен отговор: ${entry.correctOption}.`
            : `Твоят избор: ${selectedAnswer}. Верен отговор: ${entry.correctOption}.`}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mistake list card
// ---------------------------------------------------------------------------
function MistakeCard({ entry, onUpdate }: { entry: MistakeEntry; onUpdate: () => void }) {
  const [tagInput, setTagInput] = useState('')

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const tag = tagInput.trim()
    if (!tag || entry.topics.includes(tag)) return
    updateEntry(entry.id, { topics: [...entry.topics, tag] })
    setTagInput('')
    onUpdate()
  }

  const removeTag = (tag: string) => {
    updateEntry(entry.id, { topics: entry.topics.filter((t) => t !== tag) })
    onUpdate()
  }

  const handleErrorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateEntry(entry.id, { errorType: (e.target.value as MistakeEntry['errorType']) || null })
    onUpdate()
  }

  const correctAttempts = entry.attempts.filter((a) => a.correct).length
  const totalAttempts = entry.attempts.length

  return (
    <div className={cn('card p-4 space-y-3', entry.mastered && 'opacity-60 border-l-4 border-l-success')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold text-primary font-mono">
          {entry.examYear} · {entry.examSubject} · Въпрос {entry.questionNumber}
        </span>
        {entry.mastered && (
          <span className="badge bg-success-light text-success text-xs">Усвоен ✓</span>
        )}
      </div>

      {/* Question text */}
      <p className="text-sm text-text leading-relaxed line-clamp-3">
        {entry.questionText || '—'}
      </p>

      {/* Wrong → Correct */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="badge bg-danger-light text-danger text-xs">✗ {entry.userAnswer}</span>
        <span className="text-text-muted text-xs">→</span>
        <span className="badge bg-success-light text-success text-xs">✓ {entry.correctOption}</span>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="text-xs border border-border rounded-full px-3 py-1 bg-surface text-text focus:outline-none focus:border-primary"
          value={entry.errorType || ''}
          onChange={handleErrorTypeChange}
        >
          <option value="">Тип грешка…</option>
          <option value="conceptual">Концептуална</option>
          <option value="careless">Невнимание</option>
          <option value="calculation">Изчислителна</option>
        </select>

        {entry.topics.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 badge bg-primary-light text-primary text-xs">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition-colors font-bold"
              aria-label={`Премахни тема ${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          placeholder="+ тема (Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="text-xs border border-dashed border-border rounded-full px-3 py-1 bg-transparent text-text placeholder:text-text-muted focus:outline-none focus:border-primary w-32"
        />
      </div>

      {/* Footer */}
      <p className="text-xs text-text-muted font-mono">
        {totalAttempts} опит{totalAttempts !== 1 ? 'а' : ''} · {correctAttempts} верни · последно {formatDate(entry.lastSeen)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
type Section = 'all' | 'retry' | 'weekly'

export default function MistakesPage() {
  const [entries, setEntries] = useState<MistakeEntry[]>([])
  const [section, setSection] = useState<Section>('all')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [errorTypeFilter, setErrorTypeFilter] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)

  const reload = useCallback(() => {
    setEntries(loadMistakes())
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const nonMastered = entries.filter((e) => !e.mastered)
  const subjects = [...new Set(entries.map((e) => e.examSubject))].sort()

  const filteredEntries = entries
    .filter((e) => !subjectFilter || e.examSubject === subjectFilter)
    .filter((e) => !errorTypeFilter || e.errorType === errorTypeFilter)
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))

  const weeklyEntries = getWeeklySet(entries)

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Тетрадка с грешки" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-text">{entries.length}</p>
            <p className="text-xs text-text-muted mt-1">Общо грешки</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-danger">{nonMastered.length}</p>
            <p className="text-xs text-text-muted mt-1">За упражнение</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-success">{entries.length - nonMastered.length}</p>
            <p className="text-xs text-text-muted mt-1">Усвоени</p>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'retry', 'weekly'] as Section[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                section === s
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-muted hover:text-text'
              )}
            >
              {s === 'all' && `Всички грешки${entries.length ? ` (${entries.length})` : ''}`}
              {s === 'retry' && `Упражни${nonMastered.length ? ` (${nonMastered.length})` : ''}`}
              {s === 'weekly' && `Седмичен преговор${weeklyEntries.length ? ` (${weeklyEntries.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* ── All mistakes ── */}
        {section === 'all' && (
          <div className="space-y-4">
            {entries.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                <select
                  className="input-field text-sm flex-1 min-w-[140px]"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  <option value="">Всички предмети</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="input-field text-sm flex-1 min-w-[140px]"
                  value={errorTypeFilter}
                  onChange={(e) => setErrorTypeFilter(e.target.value)}
                >
                  <option value="">Всички типове грешки</option>
                  {Object.entries(ERROR_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            )}

            {filteredEntries.length === 0 ? (
              <div className="card p-8 text-center text-text-muted text-sm">
                {entries.length === 0
                  ? 'Нямаш записани грешки. Реши тест и натисни „Провери отговорите".'
                  : 'Няма грешки за избраните филтри.'}
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <MistakeCard key={entry.id} entry={entry} onUpdate={reload} />
              ))
            )}
          </div>
        )}

        {/* ── Retry ── */}
        {section === 'retry' && (
          <div className="space-y-4">
            {nonMastered.length === 0 ? (
              <div className="card p-8 text-center text-text-muted text-sm">
                Всички грешки са усвоени. Страхотно!
              </div>
            ) : (
              <>
                <p className="text-sm text-text-muted">
                  Отговори правилно 2 пъти подред, за да усвоиш въпроса.
                </p>
                {nonMastered.map((entry) => (
                  <RetryCard
                    key={`${entry.id}-${retryVersion}`}
                    entry={entry}
                    onAttempt={() => {
                      reload()
                      setRetryVersion((v) => v + 1)
                    }}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Weekly ── */}
        {section === 'weekly' && (
          <div className="space-y-4">
            {weeklyEntries.length === 0 ? (
              <div className="card p-8 text-center text-text-muted text-sm">
                Няма въпроси за седмичния преговор. Грешки от последните 7 дни ще се появят тук.
              </div>
            ) : (
              <>
                <p className="text-sm text-text-muted">
                  {weeklyEntries.length} въпрос{weeklyEntries.length !== 1 ? 'а' : ''} от последните 7 дни.
                </p>
                {weeklyEntries.map((entry) => (
                  <RetryCard
                    key={entry.id}
                    entry={entry}
                    onAttempt={reload}
                  />
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
