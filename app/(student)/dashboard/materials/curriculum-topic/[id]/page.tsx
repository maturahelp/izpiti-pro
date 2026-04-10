'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
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
  const id = Number(params.id)

  const topic = allTopics[id]

  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setSelected({})
    setSubmitted(false)
  }, [id])

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

  function handleSelect(qIdx: number, optIdx: number) {
    if (submitted) return
    setSelected((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  function handleSubmit() {
    if (!allAnswered) return
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setSelected({})
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={topic.title} />

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
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

        {/* Theory card */}
        <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5 mb-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            Учебни теми — 7. клас
          </p>
          <h1 className="text-lg md:text-xl font-bold text-text mb-3">{topic.title}</h1>

          {/* Definition */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Определение</p>
            <p className="text-sm text-text leading-relaxed">{topic.definition}</p>
          </div>

          {/* Key points */}
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

          {/* Common mistakes */}
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

          {/* Score after submit */}
          {submitted && (
            <div className={cn(
              'mt-5 rounded-xl p-4 text-center',
              score >= exercises.length * 0.8
                ? 'bg-success/10 border border-success/30'
                : score >= exercises.length * 0.5
                  ? 'bg-amber/10 border border-amber/30'
                  : 'bg-danger/10 border border-danger/30'
            )}>
              <p className="text-2xl font-bold text-text mb-1">{score}/{exercises.length}</p>
              <p className={cn(
                'text-sm font-semibold',
                score >= exercises.length * 0.8 ? 'text-success' :
                score >= exercises.length * 0.5 ? 'text-amber' : 'text-danger'
              )}>
                {score >= exercises.length * 0.8 ? 'Отлично!' :
                 score >= exercises.length * 0.5 ? 'Добре!' : 'Трябва повече практика'}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 rounded-xl px-5 py-2 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Опитай отново
              </button>
            </div>
          )}
        </div>

        {/* Exercises header */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
            Упражнения ({exercises.length} въпроса)
          </h2>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {exercises.map((ex, qIdx) => {
            const selectedOpt = selected[qIdx]
            const isCorrect = submitted && selectedOpt === ex.correct_index
            const isWrong = submitted && selectedOpt !== undefined && selectedOpt !== ex.correct_index

            return (
              <div
                key={qIdx}
                className={cn(
                  'rounded-2xl border p-4 md:p-5',
                  submitted
                    ? isCorrect
                      ? 'border-success/40 bg-success/5'
                      : isWrong
                        ? 'border-danger/40 bg-danger/5'
                        : 'border-border bg-white'
                    : 'border-border bg-white'
                )}
              >
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
                    } else if (isSelected) {
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

                {submitted && isWrong && (
                  <p className="mt-3 ml-9 text-xs text-text-muted italic leading-relaxed">
                    {ex.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Submit button */}
        {!submitted && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={cn(
                'w-full max-w-sm rounded-xl py-3 text-sm font-semibold transition-colors',
                allAnswered
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-100 text-text-muted cursor-not-allowed'
              )}
            >
              {allAnswered
                ? 'Провери отговорите'
                : `Отговори на всички въпроси (${Object.keys(selected).length}/${exercises.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
