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
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  useEffect(() => {
    setSelected({})
    setSubmitted(false)
    setCurrentIndex(0)
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
  const currentExercise = exercises[Math.min(currentIndex, Math.max(exercises.length - 1, 0))]

  const score = submitted
    ? exercises.filter((ex, idx) => selected[idx] === ex.correct_index).length
    : 0

  const allAnswered = exercises.every((_, idx) => selected[idx] !== undefined)
  const currentAnswered = selected[currentIndex] !== undefined

  function handleSelect(qIdx: number, optIdx: number) {
    if (submitted) return
    setSelected((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  function handleSubmit() {
    if (!allAnswered) return
    setSubmitted(true)
    setConfettiTrigger((value) => value + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setSelected({})
    setSubmitted(false)
    setCurrentIndex(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <ConfettiBurst trigger={confettiTrigger} message="Тестът е проверен!" />
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
            </div>

            {!submitted && currentExercise && (
              <div className="space-y-4">
                {(() => {
                const ex = currentExercise
                const qIdx = currentIndex
                const selectedOpt = selected[qIdx]

                return (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-border bg-white p-4 md:p-5"
                  >
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Упражнение {qIdx + 1} от {exercises.length}
                      </p>
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
                        let optStyle = 'border-border bg-gray-50 text-text hover:border-primary/40 hover:bg-primary/5'
                        if (isSelected) {
                          optStyle = 'border-primary bg-primary/10 text-primary font-semibold'
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelect(qIdx, optIdx)}
                            className={cn(
                              'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-start gap-2.5',
                              optStyle,
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

                  </div>
                )
                })()}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                    disabled={currentIndex === 0}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
                      currentIndex === 0
                        ? 'border-border text-text-muted opacity-40 cursor-not-allowed'
                        : 'border-border text-text hover:border-primary hover:text-primary'
                    )}
                  >
                    Предишен
                  </button>
                  <span className="text-xs font-semibold text-text-muted">
                    {currentIndex + 1} / {exercises.length}
                  </span>
                  {currentIndex === exercises.length - 1 ? (
                    <button
                      type="button"
                      disabled={!allAnswered}
                      onClick={handleSubmit}
                      className={cn(
                        'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
                        allAnswered ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-text-muted cursor-not-allowed'
                      )}
                    >
                      Провери отговорите
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!currentAnswered}
                      onClick={() => setCurrentIndex((index) => Math.min(index + 1, exercises.length - 1))}
                      className={cn(
                        'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
                        currentAnswered ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-text-muted cursor-not-allowed'
                      )}
                    >
                      Следващ въпрос
                    </button>
                  )}
                </div>
              </div>
            )}

            {submitted && (
              <div className="space-y-4">
                <div className={cn(
                  'rounded-2xl border p-4 text-center',
                  score >= exercises.length * 0.8 ? 'border-success/30 bg-success/10' : 'border-amber/30 bg-amber/10'
                )}>
                  <p className="text-2xl font-bold text-text">{score}/{exercises.length}</p>
                  <p className="text-sm font-semibold text-text-muted mt-1">верни отговори</p>
                </div>
                {exercises.map((ex, qIdx) => {
                  const selectedOpt = selected[qIdx]
                  const isCorrect = selectedOpt === ex.correct_index
                  return (
                    <div key={qIdx} className={cn('rounded-2xl border p-4 md:p-5', isCorrect ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5')}>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Упражнение #{qIdx + 1}</p>
                      <p className="text-sm font-medium text-text leading-relaxed mb-3">{ex.question}</p>
                      <p className={cn('rounded-lg px-3 py-2 text-sm font-semibold', isCorrect ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
                        {isCorrect ? 'Верен отговор' : `Верен отговор: ${OPTION_LABELS[ex.correct_index]}`}
                      </p>
                      {!isCorrect && <p className="mt-3 text-xs text-text-muted italic leading-relaxed">{ex.explanation}</p>}
                    </div>
                  )
                })}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl py-3 text-sm font-semibold bg-white border border-primary text-primary hover:bg-primary/5 transition-colors"
                >
                  Опитай отново
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
