'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { tests, sampleQuestions } from '@/data/tests'
import { nvoQuestions } from '@/data/nvo-questions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const test = tests.find((t) => t.id === params.id) || tests[0]
  const allQuestions = [...sampleQuestions, ...nvoQuestions]
  const questions = allQuestions.filter((q) => q.testId === test.id)
  // Use all sample questions if test has no questions
  const displayQuestions = questions.length > 0 ? questions : sampleQuestions

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const currentQuestion = displayQuestions[currentIndex]
  const selected = selectedAnswers[currentQuestion?.id]
  const answered = Object.keys(selectedAnswers).length
  const isLast = currentIndex === displayQuestions.length - 1

  if (submitted) {
    return <TestResults test={test} questions={displayQuestions} answers={selectedAnswers} />
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={test.title} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto">

        {/* Progress header */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-muted">
              Въпрос {currentIndex + 1} от {displayQuestions.length}
            </span>
            <span className="text-sm font-semibold text-text">
              {answered} отговорени
            </span>
          </div>
          <div className="flex gap-1">
            {displayQuestions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-colors',
                  i < currentIndex
                    ? selectedAnswers[displayQuestions[i].id] !== undefined
                      ? 'bg-primary'
                      : 'bg-gray-200'
                    : i === currentIndex
                    ? 'bg-primary/50'
                    : 'bg-gray-100'
                )}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="card p-6 mb-4">
          <div className="flex items-start gap-3 mb-6">
            <span className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {currentIndex + 1}
            </span>
            <p className="text-base font-medium text-text leading-relaxed">{currentQuestion?.text}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: i }))}
                className={cn(
                  'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 text-sm font-medium',
                  selected === i
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border bg-white text-text hover:border-primary/40 hover:bg-gray-50'
                )}
              >
                <span className="inline-flex items-center gap-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
                    selected === i ? 'border-primary bg-primary text-white' : 'border-border text-text-muted'
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-40"
          >
            Предишен
          </button>

          <div className="flex items-center gap-2">
            {displayQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                  i === currentIndex
                    ? 'bg-primary text-white'
                    : selectedAnswers[displayQuestions[i].id] !== undefined
                    ? 'bg-primary-light text-primary'
                    : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {isLast ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={answered < displayQuestions.length}
              className="btn-primary disabled:opacity-40"
            >
              Предай теста
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(displayQuestions.length - 1, i + 1))}
              className="btn-primary"
            >
              Следващ
            </button>
          )}
        </div>

        {answered < displayQuestions.length && isLast && (
          <p className="text-center text-xs text-text-muted mt-3">
            Все още имаш {displayQuestions.length - answered} неотговорени въпроса
          </p>
        )}
      </div>
    </div>
  )
}

function TestResults({ test, questions, answers }: {
  test: ReturnType<typeof tests.find>
  questions: typeof sampleQuestions
  answers: Record<string, number>
}) {
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const total = questions.length
  const score = Math.round((correct / total) * 100)
  const passed = score >= 60

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Резултати" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        {/* Score card */}
        <div className={cn('card p-8 text-center', passed ? 'border-success/30' : 'border-danger/30')}>
          <p className="text-sm font-semibold text-text-muted mb-2">Твоят резултат</p>
          <p className={cn(
            'text-6xl font-bold font-serif mb-2',
            score >= 80 ? 'text-success' : score >= 60 ? 'text-amber' : 'text-danger'
          )}>
            {score}%
          </p>
          <p className="text-text-muted text-sm mb-4">
            {correct} верни от {total} въпроса
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              {correct} верни
            </span>
            <span className="flex items-center gap-1.5 text-danger font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              {total - correct} грешни
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/tests" className="btn-secondary">
            Обратно към тестовете
          </Link>
          <Link href={`/dashboard/tests/${test?.id}`} className="btn-primary">
            Опитай отново
          </Link>
          <Link href="/dashboard/ai" className="btn-ghost border border-border">
            Питай AI за грешките
          </Link>
        </div>

        {/* Question review */}
        <div>
          <h2 className="font-semibold text-text mb-3">Преглед на отговорите</h2>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isCorrect = answers[q.id] === q.correctIndex
              return (
                <div key={q.id} className={cn('card p-5', isCorrect ? 'border-success/30' : 'border-danger/30')}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                      isCorrect ? 'bg-success-light' : 'bg-danger-light'
                    )}>
                      {isCorrect ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text">{q.text}</p>
                  </div>

                  {!isCorrect && (
                    <div className="pl-9 space-y-1.5 mb-3">
                      <p className="text-xs text-danger">
                        Твоят отговор: <strong>{q.options[answers[q.id]]}</strong>
                      </p>
                      <p className="text-xs text-success">
                        Верен отговор: <strong>{q.options[q.correctIndex]}</strong>
                      </p>
                    </div>
                  )}

                  <div className="pl-9 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-text-muted leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
