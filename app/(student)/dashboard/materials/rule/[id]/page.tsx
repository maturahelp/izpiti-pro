'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { ConfettiBurst } from '@/components/shared/ConfettiBurst'
import { cn } from '@/lib/utils'
import questionBank from '@/data/bel_topics_question_bank.json'

interface Question {
  number: number
  type: string
  text: string
  options: string[]
  correct_index: number
  correct_answer: string
  explanation: string
}

interface Topic {
  title: string
  question_count: number
  questions: Question[]
}

interface Section {
  title: string
  topics: Topic[]
}

// Build a flat list of all topics with their section info
const allTopics: { sectionTitle: string; sectionIndex: number; topicIndex: number; topic: Topic }[] = []
;(questionBank.sections as Section[]).forEach((section, si) => {
  section.topics.forEach((topic, ti) => {
    allTopics.push({ sectionTitle: section.title, sectionIndex: si, topicIndex: ti, topic })
  })
})

const OPTION_LABELS = ['А', 'Б', 'В', 'Г']

export default function RuleQuizPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const entry = allTopics[id]

  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  useEffect(() => {
    if (entry) {
      setShuffledQuestions([...entry.topic.questions])
      setSelected({})
      setSubmitted(false)
      setCurrentIndex(0)
    }
  }, [id])

  if (!entry) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Тема не е намерена" />
        <div className="p-6 text-center text-text-muted">
          <p>Темата не съществува.</p>
        </div>
      </div>
    )
  }

  const { sectionTitle, topic } = entry
  const questions = shuffledQuestions.length ? shuffledQuestions : topic.questions

  const score = submitted
    ? questions.filter((q, idx) => selected[idx] === q.correct_index).length
    : 0

  const allAnswered = questions.every((_, idx) => selected[idx] !== undefined)
  const currentQuestion = questions[Math.min(currentIndex, Math.max(questions.length - 1, 0))]
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/materials')}
            className="hover:text-primary transition-colors"
          >
            Материали
          </button>
          <span>/</span>
          <span className="text-text-muted">{sectionTitle}</span>
          <span>/</span>
          <span className="text-text font-medium">{topic.title}</span>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5 mb-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{sectionTitle}</p>
          <h1 className="text-lg md:text-xl font-bold text-text mb-2">{topic.title}</h1>
          <p className="text-sm text-text-muted">{questions.length} въпроса • Избери верния отговор</p>

          {submitted && (
            <div className={cn(
              'mt-4 rounded-xl p-4 text-center',
              score >= questions.length * 0.8
                ? 'bg-success/10 border border-success/30'
                : score >= questions.length * 0.5
                  ? 'bg-amber/10 border border-amber/30'
                  : 'bg-danger/10 border border-danger/30'
            )}>
              <p className="text-2xl font-bold text-text mb-1">{score}/{questions.length}</p>
              <p className={cn(
                'text-sm font-semibold',
                score >= questions.length * 0.8 ? 'text-success' :
                score >= questions.length * 0.5 ? 'text-amber' : 'text-danger'
              )}>
                {score >= questions.length * 0.8 ? 'Отлично!' :
                 score >= questions.length * 0.5 ? 'Добре!' : 'Трябва повече практика'}
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

        {!submitted && currentQuestion && (
          <div className="space-y-4">
            {(() => {
            const q = currentQuestion
            const qIdx = currentIndex
            const selectedOpt = selected[qIdx]

            return (
              <div
                key={qIdx}
                className="rounded-2xl border border-border bg-white p-4 md:p-5"
              >
                <p className="mb-3 text-xs font-semibold text-primary uppercase tracking-wide">
                  Въпрос {qIdx + 1} от {questions.length}
                </p>
                <div className="flex gap-3 mb-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {qIdx + 1}
                  </span>
                  <p className="text-sm font-medium text-text leading-relaxed">{q.text}</p>
                </div>

                <div className="space-y-2 pl-9">
                  {q.options.map((opt, optIdx) => {
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
                {currentIndex + 1} / {questions.length}
              </span>
              {currentIndex === questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered}
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
                  onClick={() => setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))}
                  disabled={!currentAnswered}
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
            {questions.map((q, qIdx) => {
              const selectedOpt = selected[qIdx]
              const isCorrect = selectedOpt === q.correct_index
              return (
                <div key={qIdx} className={cn('rounded-2xl border p-4 md:p-5', isCorrect ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5')}>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Въпрос #{qIdx + 1}</p>
                  <p className="text-sm font-medium text-text leading-relaxed mb-3">{q.text}</p>
                  <p className={cn('rounded-lg px-3 py-2 text-sm font-semibold', isCorrect ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
                    {isCorrect ? 'Верен отговор' : `Верен отговор: ${OPTION_LABELS[q.correct_index]}`}
                  </p>
                  {!isCorrect && <p className="mt-3 text-xs text-text-muted italic leading-relaxed">{q.explanation}</p>}
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
      </div>
    </div>
  )
}
