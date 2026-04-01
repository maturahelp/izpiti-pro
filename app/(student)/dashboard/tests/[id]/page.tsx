'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { tests, sampleQuestions } from '@/data/tests'
import { nvoQuestions } from '@/data/nvo-questions'
import { nvoExamMeta } from '@/data/nvo-exam-meta'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export default function TestPage() {
  const params = useParams()
  const test = tests.find((t) => t.id === params.id) || tests[0]
  const allQuestions = [...sampleQuestions, ...nvoQuestions]
  const questions = allQuestions.filter((q) => q.testId === test.id)
  const displayQuestions = questions.length > 0 ? questions : sampleQuestions

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showContext, setShowContext] = useState(true)

  const meta = nvoExamMeta[test.id]
  const answered = Object.keys(selectedAnswers).length
  const total = displayQuestions.length

  if (submitted) {
    return (
      <TestResults
        test={test}
        questions={displayQuestions}
        answers={selectedAnswers}
        meta={meta}
        onRetry={() => { setSelectedAnswers({}); setSubmitted(false) }}
      />
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={test.title} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto">

        {/* Context panel (BEL exams) */}
        {meta?.contextText && (
          <div className="card mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">Изходен текст към изпита</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowContext((v) => !v)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {showContext ? 'Скрий текста' : 'Покажи текста'}
                </button>
              </div>
            </div>
            {showContext && (
              <div className="p-5 space-y-4">
                <p className="text-sm text-text leading-relaxed whitespace-pre-line">{meta.contextText}</p>
                {meta.contextImage && (
                  <div className="mt-4">
                    <Image
                      src={meta.contextImage}
                      alt="Инфографика към изпита"
                      width={700}
                      height={400}
                      className="rounded-lg w-full h-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-muted">Напредък</span>
            <span className="text-sm font-semibold text-text">{answered} / {total} отговорени</span>
          </div>
          <div className="flex gap-0.5">
            {displayQuestions.map((q) => (
              <div
                key={q.id}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-colors',
                  selectedAnswers[q.id] !== undefined ? 'bg-primary' : 'bg-gray-100'
                )}
              />
            ))}
          </div>
        </div>

        {/* All questions */}
        <div className="space-y-5">
          {displayQuestions.map((q, i) => (
            <div key={q.id} className="card p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-text leading-relaxed">{q.text}</p>
              </div>

              <div className="space-y-2 pl-10">
                {q.options.map((option, oi) => (
                  <button
                    key={oi}
                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm font-medium',
                      selectedAnswers[q.id] === oi
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border bg-white text-text hover:border-primary/40 hover:bg-gray-50'
                    )}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
                        selectedAnswers[q.id] === oi ? 'border-primary bg-primary text-white' : 'border-border text-text-muted'
                      )}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={() => setSubmitted(true)}
            disabled={answered < total}
            className="btn-primary w-full max-w-xs disabled:opacity-40"
          >
            Провери отговорите
          </button>
          {answered < total && (
            <p className="text-xs text-text-muted">
              Остават {total - answered} неотговорени въпроса
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TestResults({ test, questions, answers, meta, onRetry }: {
  test: ReturnType<typeof tests.find>
  questions: typeof sampleQuestions
  answers: Record<string, number>
  meta: typeof nvoExamMeta[string] | undefined
  onRetry: () => void
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
          <button onClick={onRetry} className="btn-primary">
            Опитай отново
          </button>
        </div>

        {/* Question review — all on one page */}
        <div>
          <h2 className="font-semibold text-text mb-3">Преглед на отговорите</h2>
          <div className="space-y-4">
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
                    <p className="text-sm font-medium text-text"><span className="text-text-muted mr-1">{i + 1}.</span>{q.text}</p>
                  </div>

                  <div className="pl-9 space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[q.id] === oi
                      const isRight = q.correctIndex === oi
                      return (
                        <div key={oi} className={cn(
                          'px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2',
                          isRight ? 'bg-success-light text-success' :
                          isSelected && !isRight ? 'bg-danger-light text-danger' :
                          'text-text-muted'
                        )}>
                          <span className="font-bold">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                          {isRight && <span className="ml-auto text-success">✓</span>}
                          {isSelected && !isRight && <span className="ml-auto text-danger">✗</span>}
                        </div>
                      )
                    })}
                  </div>

                  {q.explanation && (
                    <div className="pl-9 mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-text-muted leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
