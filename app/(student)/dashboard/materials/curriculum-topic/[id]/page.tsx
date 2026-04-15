'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { ConfettiBurst } from '@/components/shared/ConfettiBurst'
import { cn } from '@/lib/utils'
import topicsData from '@/data/bel_curriculum_topics_content.json'

interface Exercise {
  number: number
  type: string
  question: string
  options: string[]
  correct_index: number
  correct_answer: string
  explanation: string
  difficulty?: string
  skill?: string
}

interface CurriculumTopic {
  number: number
  title: string
  definition: string
  key_points: string[]
  common_mistakes: string[]
  source_urls: string[]
  exercises: Exercise[]
}

const allTopics = topicsData.topics as CurriculumTopic[]

const OPTION_LABELS = ['А', 'Б', 'В', 'Г']

export default function CurriculumTopicPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = Number(params.id)
  const viewMode = searchParams.get('view')
  const showTheory = viewMode !== 'exercise'
  const showExercises = viewMode !== 'theory'

  const topic = allTopics[id]

  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confettiKey, setConfettiKey] = useState(0)
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null)
  const [celebrated, setCelebrated] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setSelected({})
    setSubmitted(false)
    setCurrentIndex(0)
    setCelebrated({})
  }, [id, viewMode])

  if (!topic) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Тема не е намерена" />
        <div className="p-6 text-center text-text-muted">
          <p>Темата не съществува.</p>
        </div>
      </div>
    )
  }

  const exercises = topic.exercises

  const score = submitted
    ? exercises.filter((ex, idx) => selected[idx] === ex.correct_index).length
    : 0

  const allAnswered = exercises.every((_, idx) => selected[idx] !== undefined)
  const currentExercise = exercises[currentIndex] ?? exercises[0]
  const currentSelected = selected[currentIndex]
  const currentAnswered = currentSelected !== undefined
  const progressPercent = exercises.length ? ((currentIndex + 1) / exercises.length) * 100 : 0

  function handleSelect(qIdx: number, optIdx: number, button: HTMLElement) {
    if (submitted) return
    setSelected((prev) => ({ ...prev, [qIdx]: optIdx }))
    if (optIdx === exercises[qIdx]?.correct_index && !celebrated[qIdx]) {
      const rect = button.getBoundingClientRect()
      setConfettiOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
      setConfettiKey((value) => value + 1)
      setCelebrated((prev) => ({ ...prev, [qIdx]: true }))
    }
  }

  function handleSubmit() {
    if (!allAnswered || currentIndex < exercises.length - 1) return
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setSelected({})
    setSubmitted(false)
    setCurrentIndex(0)
    setCelebrated({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retryCurrentQuestion() {
    setSelected((prev) => {
      const next = { ...prev }
      delete next[currentIndex]
      return next
    })
  }

  function handleNextQuestion() {
    if (!currentAnswered) return
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((value) => value + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    handleSubmit()
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <ConfettiBurst burstKey={confettiKey} origin={confettiOrigin} />
      <TopBar title={topic.title} />

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mb-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/materials')}
            className="hover:text-primary transition-colors"
          >
            Материали
          </button>
          <span>/</span>
          <span className="text-text-muted">Учебни теми — 7. клас</span>
          <span>/</span>
          <span className="text-text font-medium">{topic.title}</span>
        </div>

        {showTheory && (
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5 mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Учебни теми — 7. клас
            </p>
            <h1 className="text-lg md:text-xl font-bold text-text mb-3">{topic.title}</h1>

            <div className="mb-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Определение</p>
              <p className="text-sm text-text leading-relaxed">{topic.definition}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Ключови точки</p>
              <ul className="space-y-1.5">
                {topic.key_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Чести грешки</p>
              <ul className="space-y-1.5">
                {topic.common_mistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text">
                    <span className="flex-shrink-0 mt-0.5 text-danger">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {showExercises && (
          <>
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                Упражнения ({exercises.length} въпроса)
              </h2>
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-text-muted">
                  <span>Въпрос {currentIndex + 1} от {exercises.length}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {currentExercise && (() => {
                const ex = currentExercise
                const qIdx = currentIndex
                const selectedOpt = currentSelected
                const isCorrect = selectedOpt === ex.correct_index
                const isWrong = selectedOpt !== undefined && selectedOpt !== ex.correct_index

                return (
                  <div
                    key={qIdx}
                    className={cn(
                      'rounded-2xl border p-4 md:p-5',
                      submitted || selectedOpt !== undefined
                        ? isCorrect
                          ? 'border-success/40 bg-success/5'
                          : isWrong
                            ? 'border-danger/40 bg-danger/5'
                            : 'border-border bg-white'
                        : 'border-border bg-white'
                    )}
                  >
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Упражнение #{qIdx + 1}</p>
                    </div>

                    <div className="flex gap-3 mb-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {qIdx + 1}
                      </span>
                      <p className="text-sm font-medium text-text leading-relaxed">{ex.question}</p>
                    </div>

                    <div className="space-y-2 pl-9">
                      {ex.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx
                        const isCorrectOpt = optIdx === ex.correct_index

                        let optStyle = 'border-border bg-gray-50 text-text hover:border-primary/40 hover:bg-primary/5'
                        if (submitted) {
                          if (isCorrectOpt) {
                            optStyle = 'border-success bg-success/10 text-success font-semibold'
                          } else if (isSelected && !isCorrectOpt) {
                            optStyle = 'border-danger bg-danger/10 text-danger'
                          } else {
                            optStyle = 'border-border bg-gray-50 text-text-muted'
                          }
                        } else if (isSelected && isCorrectOpt) {
                          optStyle = 'border-success bg-success/10 text-success font-semibold'
                        } else if (isSelected && !isCorrectOpt) {
                          optStyle = 'border-danger bg-danger/10 text-danger'
                        } else if (isSelected) {
                          optStyle = 'border-primary bg-primary/10 text-primary font-semibold'
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={(event) => handleSelect(qIdx, optIdx, event.currentTarget)}
                            className={cn(
                              'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-start gap-2.5',
                              optStyle,
                              submitted && 'cursor-default'
                            )}
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current text-[10px] font-bold flex items-center justify-center mt-0.5">
                              {OPTION_LABELS[optIdx]}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        )
                      })}
                    </div>

                    {isWrong && (
                      <div className="mt-3 ml-9 rounded-xl border border-danger/20 bg-danger/5 p-3">
                        <p className="text-xs text-danger font-semibold">Не е вярно. Можеш да повториш този въпрос.</p>
                        <button
                          type="button"
                          onClick={retryCurrentQuestion}
                          className="mt-2 rounded-lg border border-danger/30 bg-white px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5 transition-colors"
                        >
                          Повтори въпроса
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            <div className="sticky bottom-0 py-4 bg-white/90 backdrop-blur-sm">
              {!submitted ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                    disabled={currentIndex === 0}
                    className={cn(
                      'rounded-xl border px-5 py-3 text-sm font-semibold transition-colors',
                      currentIndex === 0
                        ? 'border-border bg-gray-50 text-text-muted cursor-not-allowed'
                        : 'border-primary text-primary hover:bg-primary/5'
                    )}
                  >
                    Предишен
                  </button>
                  <button
                    type="button"
                    disabled={!currentAnswered}
                    onClick={handleNextQuestion}
                    className={cn(
                      'rounded-xl px-6 py-3 text-sm font-semibold transition-colors',
                      currentAnswered
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-border text-text-muted cursor-not-allowed'
                    )}
                  >
                    {currentIndex === exercises.length - 1 ? 'Провери отговорите' : 'Следващ въпрос'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl py-3 text-sm font-semibold bg-white border border-primary text-primary hover:bg-primary/5 transition-colors"
                >
                  Опитай отново
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
