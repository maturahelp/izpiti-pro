'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { cn } from '@/lib/utils'
import questionBank from '@/data/bel_topics_question_bank.json'
import { fireConfetti } from '@/lib/confetti'

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

function shuffleQuestion(q: Question): Question {
  const indices = Array.from({ length: q.options.length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return {
    ...q,
    options: indices.map((i) => q.options[i]),
    correct_index: indices.indexOf(q.correct_index),
  }
}

export default function RuleQuizPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const entry = allTopics[id]

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (entry) {
      setShuffledQuestions(entry.topic.questions.map(shuffleQuestion))
      setCurrentIndex(0)
      setSelectedOpt(null)
      setChecked(false)
      setAnswers({})
      setFinished(false)
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

  const score = questions.filter((q, idx) => answers[idx] === q.correct_index).length

  function handleSelect(optIdx: number) {
    if (checked) return
    setSelectedOpt(optIdx)
  }

  function handleCheck() {
    if (selectedOpt === null) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: selectedOpt }))
    setChecked(true)
    if (selectedOpt === questions[currentIndex].correct_index) {
      fireConfetti()
    }
  }

  function handleRetryQuestion() {
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[currentIndex]
      return next
    })
    setSelectedOpt(null)
    setChecked(false)
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
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
        </div>

        {/* Progress bar */}
        {!finished && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                Въпрос {currentIndex + 1} от {questions.length}
              </h2>
              <span className="text-xs text-text-muted font-semibold">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Single question card */}
        {!finished && (() => {
          const q = questions[currentIndex]
          const isCorrect = checked && selectedOpt === q.correct_index
          const isWrong = checked && selectedOpt !== null && selectedOpt !== q.correct_index

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
              <div className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {currentIndex + 1}
                </span>
                <p className="text-sm font-medium text-text leading-relaxed">{q.text}</p>
              </div>

              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOpt === optIdx
                  const isCorrectOpt = optIdx === q.correct_index

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
                  {q.explanation}
                </p>
              )}
            </div>
          )
        })()}

        {/* Action buttons */}
        {!finished && (
          <div className="flex flex-col gap-2 mt-2">
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
            ) : selectedOpt === questions[currentIndex].correct_index ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full rounded-xl py-3 text-sm font-semibold bg-success text-white hover:bg-success/90 transition-colors"
              >
                {currentIndex + 1 >= questions.length ? 'Виж резултата' : 'Следващ въпрос →'}
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
                  {currentIndex + 1 >= questions.length ? 'Виж резултата' : 'Следващ въпрос →'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Score screen */}
        {finished && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center py-8">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-6 border-4',
                score >= questions.length * 0.8
                  ? 'bg-success/10 text-success border-success'
                  : score >= questions.length * 0.5
                    ? 'bg-amber-100 text-amber-600 border-amber-400'
                    : 'bg-danger/10 text-danger border-danger'
              )}
            >
              {score}/{questions.length}
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">
              {score >= questions.length * 0.8
                ? 'Отлично!'
                : score >= questions.length * 0.5
                  ? 'Добре!'
                  : 'Опитай пак!'}
            </h2>
            <p className="text-text-muted mb-8">
              Верни отговори:{' '}
              <strong className="text-text">{score}</strong> от{' '}
              <strong className="text-text">{questions.length}</strong>
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
