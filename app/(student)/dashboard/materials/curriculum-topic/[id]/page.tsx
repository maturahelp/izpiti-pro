'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { cn } from '@/lib/utils'
import topicsData from '@/data/bel_curriculum_topics_content.json'
import { fireConfetti } from '@/lib/confetti'

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
  short_title?: string
  subtitle?: string
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
  const showExercises = viewMode === 'exercise'

  const topic = allTopics[id]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setCurrentIndex(0)
    setSelectedOpt(null)
    setChecked(false)
    setAnswers({})
    setFinished(false)
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
  const displayTitle = topic.short_title ?? topic.title

  const score = exercises.filter((ex, idx) => answers[idx] === ex.correct_index).length

  function handleSelect(optIdx: number) {
    if (checked) return
    setSelectedOpt(optIdx)
  }

  function handleCheck() {
    if (selectedOpt === null) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: selectedOpt }))
    setChecked(true)
    if (selectedOpt === exercises[currentIndex].correct_index) {
      fireConfetti()
    }
  }

  function handleRetryQuestion() {
    setSelectedOpt(null)
    setChecked(false)
  }

  function handleNext() {
    if (currentIndex + 1 >= exercises.length) {
      setFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedOpt(null)
      setChecked(false)
    }
  }

  function handleRestart() {
    setCurrentIndex(0)
    setSelectedOpt(null)
    setChecked(false)
    setAnswers({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={displayTitle} />

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
          <span className="text-text font-medium">{displayTitle}</span>
        </div>

        <div className="mb-6">
          <div className="rounded-sm border border-[#BCD6EF] bg-[#F2F8FF] p-5 md:p-7 shadow-[8px_8px_0_rgba(30,77,123,0.06)]">
            <h1 className="font-sans text-2xl md:text-3xl font-semibold text-text tracking-normal mb-3 leading-tight">
              {displayTitle}
            </h1>
            {topic.subtitle && (
              <p className="font-sans text-base md:text-lg font-semibold text-text leading-snug tracking-normal">
                {topic.subtitle}
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.replace(`/dashboard/materials/curriculum-topic/${id}?view=theory`)}
              className={cn(
                'rounded-lg border py-3 text-center text-sm font-bold transition-colors',
                showTheory
                  ? 'border-[#AFC4DA] bg-transparent text-[#1E4D7B]'
                  : 'border-[#D7E7F7] bg-white text-text-muted hover:bg-[#1E4D7B]/10'
              )}
            >
              Теория
            </button>
            <button
              type="button"
              onClick={() => router.replace(`/dashboard/materials/curriculum-topic/${id}?view=exercise`)}
              className={cn(
                'rounded-lg border py-3 text-center text-sm font-bold transition-colors',
                showExercises
                  ? 'border-primary bg-primary text-white hover:bg-primary-dark'
                  : 'border-[#D7E7F7] bg-white text-text-muted hover:bg-[#1E4D7B]/10'
              )}
            >
              Тест
            </button>
          </div>
        </div>

        {showTheory && (
          <div className="rounded-2xl border border-[#D7E7F7] bg-white p-4 md:p-5 mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              Накратко
            </p>
            <p className="text-sm text-text leading-relaxed mb-5">{topic.definition}</p>

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

        {showExercises && !finished && (
          <>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                  Въпрос {currentIndex + 1} от {exercises.length}
                </h2>
                <span className="text-xs text-text-muted font-semibold">
                  {currentIndex + 1}/{exercises.length}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            {(() => {
              const ex = exercises[currentIndex]
              const isCorrect = checked && selectedOpt === ex.correct_index
              const isWrong = checked && selectedOpt !== null && selectedOpt !== ex.correct_index

              return (
                <div
                  className={cn(
                    'rounded-2xl border p-4 md:p-5 mb-4',
                    checked
                      ? isCorrect
                        ? 'border-success/40 bg-success/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-white'
                  )}
                >
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Упражнение #{currentIndex + 1}
                    </p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {currentIndex + 1}
                    </span>
                    <p className="text-sm font-medium text-text leading-relaxed">{ex.question}</p>
                  </div>

                  <div className="space-y-2 pl-9">
                    {ex.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx
                      const isCorrectOpt = optIdx === ex.correct_index

                      let optStyle =
                        'border-border bg-gray-50 text-text hover:border-primary/40 hover:bg-primary/5'
                      if (checked) {
                        if (isCorrectOpt) {
                          optStyle = 'border-success bg-success/10 text-success font-semibold'
                        } else if (isSelected && !isCorrectOpt) {
                          optStyle = 'border-danger bg-danger/10 text-danger'
                        } else {
                          optStyle = 'border-border bg-gray-50 text-text-muted'
                        }
                      } else if (isSelected) {
                        optStyle = 'border-primary bg-primary/10 text-primary font-semibold'
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(optIdx)}
                          disabled={checked}
                          className={cn(
                            'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-start gap-2.5',
                            optStyle,
                            checked && 'cursor-default'
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

                  {checked && isWrong && (
                    <p className="mt-3 ml-9 text-xs text-text-muted italic leading-relaxed">
                      {ex.explanation}
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {!checked ? (
                <button
                  type="button"
                  disabled={selectedOpt === null}
                  onClick={handleCheck}
                  className={cn(
                    'w-full rounded-xl py-3 text-sm font-semibold transition-colors',
                    selectedOpt !== null
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  )}
                >
                  Провери отговора
                </button>
              ) : selectedOpt === exercises[currentIndex].correct_index ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full rounded-xl py-3 text-sm font-semibold bg-success text-white hover:bg-success/90 transition-colors"
                >
                  {currentIndex + 1 >= exercises.length ? 'Виж резултата' : 'Следващ въпрос →'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRetryQuestion}
                    className="w-full rounded-xl py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    Опитай пак
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full rounded-xl py-3 text-sm font-semibold bg-white border border-border text-text-muted hover:border-primary/40 transition-colors"
                  >
                    {currentIndex + 1 >= exercises.length ? 'Виж резултата' : 'Следващ въпрос →'}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {showExercises && finished && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center py-8">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-6 border-4',
                score >= exercises.length * 0.8
                  ? 'bg-success/10 text-success border-success'
                  : score >= exercises.length * 0.5
                    ? 'bg-amber-100 text-amber-600 border-amber-400'
                    : 'bg-danger/10 text-danger border-danger'
              )}
            >
              {score}/{exercises.length}
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">
              {score >= exercises.length * 0.8
                ? 'Отлично!'
                : score >= exercises.length * 0.5
                  ? 'Добре!'
                  : 'Опитай пак!'}
            </h2>
            <p className="text-text-muted mb-8">
              Верни отговори:{' '}
              <strong className="text-text">{score}</strong> от{' '}
              <strong className="text-text">{exercises.length}</strong>
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="w-full max-w-xs rounded-xl py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Опитай отново
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
