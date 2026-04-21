'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { getDziExerciseForWork } from '@/data/dziLiteratureExercises'
import { getExerciseForWork as getNvoExerciseForWork, type LiteratureQuestion } from '@/data/nvoLiteratureExercises'
import { literatureWorks } from '@/data/literatureWorks'
import { nvoLiteratureWorks } from '@/data/nvoLiteratureWorks'
import { cn } from '@/lib/utils'
import { fireConfetti } from '@/lib/confetti'
import { logActivity } from '@/lib/activity-log'

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const
type OptionKey = typeof OPTION_KEYS[number]

function shuffleLiteratureQuestion(q: LiteratureQuestion): LiteratureQuestion {
  const order = [...OPTION_KEYS] as OptionKey[]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const newOptions = {} as Record<OptionKey, string>
  for (let i = 0; i < OPTION_KEYS.length; i++) {
    newOptions[OPTION_KEYS[i]] = q.options[order[i]]
  }
  const newCorrectKey = OPTION_KEYS[order.indexOf(q.correct_answer)]
  return { ...q, options: newOptions, correct_answer: newCorrectKey }
}

const optionLabels: Record<OptionKey, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' }

function ScoreScreen({
  score,
  total,
  onRetry,
  onBack,
}: {
  score: number
  total: number
  onRetry: () => void
  onBack: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const isExcellent = pct >= 80
  const isOk = pct >= 50

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-6 border-4',
          isExcellent
            ? 'bg-success-light text-success border-success'
            : isOk
            ? 'bg-amber-light text-amber border-amber'
            : 'bg-danger-light text-danger border-danger'
        )}
      >
        {score}/{total}
      </div>

      <h2 className="text-2xl font-bold text-text mb-2">
        {isExcellent ? 'Отлично!' : isOk ? 'Добре!' : 'Опитай пак!'}
      </h2>
      <p className="text-text-muted mb-8">
        Верни отговори: <strong className="text-text">{score}</strong> от{' '}
        <strong className="text-text">{total}</strong> ({pct}%)
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold"
        >
          Опитай отново
        </button>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold"
        >
          Към материалите
        </button>
      </div>
    </div>
  )
}

function QuestionCard({
  question,
  index,
  total,
  selected,
  revealed,
  onSelect,
  onCheck,
}: {
  question: LiteratureQuestion
  index: number
  total: number
  selected: OptionKey | null
  revealed: boolean
  onSelect: (key: OptionKey) => void
  onCheck: () => void
}) {
  return (
    <div className="card p-5 md:p-7 max-w-2xl mx-auto w-full">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
        Въпрос {index + 1} от {total}
      </p>

      <div className="w-full bg-border rounded-full h-1.5 mb-5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <p className="text-base font-semibold text-text mb-5 leading-snug">{question.question}</p>

      <div className="flex flex-col gap-2.5">
        {OPTION_KEYS.map((key) => {
          const isSelected = selected === key
          const isCorrect = key === question.correct_answer
          const showCorrect = revealed && isCorrect
          const showWrong = revealed && isSelected && !isCorrect

          return (
            <button
              key={key}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(key)}
              className={cn(
                'w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors flex items-start gap-3',
                showCorrect
                  ? 'bg-success-light border-success text-success font-semibold'
                  : showWrong
                  ? 'bg-danger-light border-danger text-danger font-semibold'
                  : isSelected
                  ? 'bg-primary-light border-primary text-primary font-semibold'
                  : 'bg-white border-border text-text hover:bg-primary-light hover:border-primary'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full border w-6 h-6 min-w-[1.5rem] text-xs font-bold',
                  showCorrect
                    ? 'bg-success text-white border-success'
                    : showWrong
                    ? 'bg-danger text-white border-danger'
                    : isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-muted'
                )}
              >
                {optionLabels[key]}
              </span>
              <span>{question.options[key]}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-4 rounded-xl bg-[#F2F8FF] border border-[#D7E7F7] p-4 text-sm text-text-muted leading-relaxed">
          <span className="font-semibold text-text block mb-1">Обяснение:</span>
          {question.explanation}
        </div>
      )}

      {!revealed && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={!selected}
            onClick={onCheck}
            className={cn(
              'w-full rounded-xl py-3 text-sm font-semibold transition-colors',
              selected
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-border text-text-muted cursor-not-allowed'
            )}
          >
            Провери отговора
          </button>
        </div>
      )}
    </div>
  )
}

export default function LiteratureExercisePage({
  params,
}: {
  params: Promise<{ workId: string }>
}) {
  const { workId } = use(params)
  const router = useRouter()

  const nvoWork = nvoLiteratureWorks.find((w) => w.id === workId)
  const dziWork = literatureWorks.find((w) => w.id === workId)
  const work = nvoWork ?? dziWork
  const exercise = getNvoExerciseForWork(workId) ?? getDziExerciseForWork(workId)
  const gradeLabel = nvoWork ? 'Литература — 7. клас' : 'Литература — 12. клас'

  const [shuffledQuestions, setShuffledQuestions] = useState<LiteratureQuestion[]>(
    () => exercise?.questions.map(shuffleLiteratureQuestion) ?? []
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)

  const handleRetry = useCallback(() => {
    setShuffledQuestions(exercise?.questions.map(shuffleLiteratureQuestion) ?? [])
    setCurrentIndex(0)
    setAnswers({})
    setRevealed({})
    setFinished(false)
  }, [exercise])

  if (!exercise || !work) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Упражнение" />
        <div className="p-6 max-w-2xl mx-auto text-center py-20 text-text-muted">
          <p className="font-semibold mb-2">Упражнението не е намерено.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary mt-4 px-6 py-2 rounded-xl text-sm font-semibold"
          >
            Назад
          </button>
        </div>
      </div>
    )
  }

  const questions = shuffledQuestions.length ? shuffledQuestions : exercise.questions
  const total = questions.length
  const question = questions[currentIndex]
  const selected = answers[currentIndex] ?? null
  const isRevealed = revealed[currentIndex] ?? false

  const score = questions.filter((q, i) => answers[i] === q.correct_answer).length

  const handleSelect = (key: OptionKey) => {
    if (isRevealed) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: key }))
  }

  const handleCheck = () => {
    if (!selected) return
    setRevealed((prev) => ({ ...prev, [currentIndex]: true }))
    if (selected === question.correct_answer) {
      fireConfetti()
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      setFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  // Log completion of the literature exercise into the activity feed.
  useEffect(() => {
    if (!finished || !work) return
    logActivity({
      type: 'literature_exercise',
      refId: work.id,
      title: work.title,
      meta: work.author,
      score,
      maxScore: total,
      href: `/dashboard/literature-exercise/${work.id}`,
    })
  }, [finished, work, score, total])

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Упражнение" />

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Work header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Назад
          </button>

          <div className="card p-4 md:p-5 flex items-start gap-4">
            <img
              src={work.image}
              alt={work.title}
              className="w-16 h-16 object-contain rounded-lg border border-border bg-white flex-shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                {gradeLabel}
              </p>
              <h1 className="text-lg font-bold text-text leading-snug">{work.title}</h1>
              <p className="text-sm text-text-muted">{work.author}</p>
            </div>
          </div>
        </div>

        {finished ? (
          <ScoreScreen
            score={score}
            total={total}
            onRetry={handleRetry}
            onBack={() => router.push('/dashboard/materials')}
          />
        ) : (
          <>
            <QuestionCard
              question={question}
              index={currentIndex}
              total={total}
              selected={selected}
              revealed={isRevealed}
              onSelect={handleSelect}
              onCheck={handleCheck}
            />

            <div className="flex items-center justify-between gap-3 mt-5 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                  currentIndex === 0
                    ? 'border-border text-text-muted opacity-40 cursor-not-allowed'
                    : 'border-border text-text hover:bg-primary-light hover:border-primary'
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Предишен
              </button>

              <span className="text-xs text-text-muted font-semibold">
                {currentIndex + 1} / {total}
              </span>

              {isRevealed ? (() => {
                const isLast = currentIndex + 1 >= total
                const label = isLast ? 'Резултат' : 'Продължи'
                return (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={cn(
                      'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                      isLast
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'border border-border text-text-muted hover:border-primary/40 bg-white'
                    )}
                  >
                    {label}
                    {!isLast && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )
              })() : (
                <span className="text-xs text-text-light italic">Избери отговор</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
