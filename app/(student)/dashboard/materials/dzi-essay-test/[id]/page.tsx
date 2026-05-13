'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { dziEssayMaterials, type DziEssayQuizQuestion } from '@/data/dziEssayMaterials'
import { isFreeDziEssayMaterial } from '@/lib/free-content'
import { createClient } from '@/lib/supabase/client'
import { hasActivePremium } from '@/lib/subscription-access'
import { cn } from '@/lib/utils'

function fireConfetti() {
  if (typeof window === 'undefined') return
  const COLORS = ['#1E4D7B', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#03A9F4', '#E91E63']
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;'
  document.body.appendChild(container)
  const cx = window.innerWidth / 2
  const cy = window.innerHeight * 0.55
  type P = { el: HTMLDivElement; x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number }
  const particles: P[] = Array.from({ length: 70 }, () => {
    const el = document.createElement('div')
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const size = 5 + Math.random() * 4
    el.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size * 0.5}px;background:${color};border-radius:2px;will-change:transform,opacity;`
    container.appendChild(el)
    const angle = Math.random() * Math.PI * 2
    const speed = 5 + Math.random() * 9
    return {
      el,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 18,
      life: 1,
    }
  })
  const start = performance.now()
  function tick(now: number) {
    const elapsed = (now - start) / 1000
    let alive = 0
    for (const p of particles) {
      if (p.life <= 0) continue
      alive++
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.35
      p.vx *= 0.99
      p.rot += p.vr
      p.life -= 0.016
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`
      p.el.style.opacity = String(Math.max(0, p.life))
    }
    if (alive > 0 && elapsed < 4) {
      requestAnimationFrame(tick)
    } else {
      container.remove()
    }
  }
  requestAnimationFrame(tick)
}

const OPTION_LABELS = ['А', 'Б', 'В', 'Г']

function shuffleQuestion(question: DziEssayQuizQuestion): DziEssayQuizQuestion {
  const indices = Array.from({ length: question.options.length }, (_, index) => index)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return {
    ...question,
    options: indices.map((index) => question.options[index]),
    correctOptionIndex: indices.indexOf(question.correctOptionIndex),
  }
}

export default function DziEssayQuizPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : params.id?.[0]
  const material = dziEssayMaterials.find((item) => item.id === id)
  const needsPremiumCheck = Boolean(material && !isFreeDziEssayMaterial(material.id))

  const [hasVerifiedPremiumAccess, setHasVerifiedPremiumAccess] = useState(false)
  const [questions, setQuestions] = useState<DziEssayQuizQuestion[]>(() =>
    material ? material.quiz.map(shuffleQuestion) : []
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!material || !needsPremiumCheck) return

    let cancelled = false
    const supabase = createClient()

    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/dashboard/subscription')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_active, plan_expires_at')
        .eq('id', user.id)
        .single()

      if (cancelled) return

      if (!hasActivePremium(profile)) {
        router.replace('/dashboard/subscription')
        return
      }

      setHasVerifiedPremiumAccess(true)
    })()

    return () => {
      cancelled = true
    }
  }, [material, needsPremiumCheck, router])

  if (!material) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Тестът не е намерен" />
        <div className="p-6 text-center text-text-muted">
          <p>Този тест не съществува.</p>
        </div>
      </div>
    )
  }

  if (needsPremiumCheck && !hasVerifiedPremiumAccess) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title={material.title} />
        <div className="p-6 text-center text-text-muted">
          <p>Проверка на достъпа...</p>
        </div>
      </div>
    )
  }

  const materialQuiz = material.quiz
  const activeQuestions = questions.length ? questions : materialQuiz
  const currentQuestion = activeQuestions[currentIndex]
  const score = activeQuestions.filter((question, index) => answers[index] === question.correctOptionIndex).length

  function handleSelect(optIdx: number) {
    if (checked) return
    setSelectedOpt(optIdx)
  }

  function handleCheck() {
    if (selectedOpt === null || !currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: selectedOpt }))
    setChecked(true)
    if (selectedOpt === currentQuestion.correctOptionIndex) {
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
    if (currentIndex + 1 >= activeQuestions.length) {
      setFinished(true)
      return
    }

    setCurrentIndex((index) => index + 1)
    setSelectedOpt(null)
    setChecked(false)
  }

  function handleRestart() {
    setQuestions(materialQuiz.map(shuffleQuestion))
    setCurrentIndex(0)
    setSelectedOpt(null)
    setChecked(false)
    setAnswers({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={material.title} />

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
          <span className="text-text-muted">Есе/Интерпретативно съчинение</span>
          <span>/</span>
          <span className="text-text font-medium">{material.title}</span>
        </div>

        <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5 mb-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{material.group}</p>
          <h1 className="text-lg md:text-xl font-bold text-text mb-2">{material.title}</h1>
          <p className="text-sm text-text-muted">{activeQuestions.length} въпроса • Избери верния отговор</p>
        </div>

        {!finished && currentQuestion && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                  Въпрос {currentIndex + 1} от {activeQuestions.length}
                </h2>
                <span className="text-xs text-text-muted font-semibold">
                  {currentIndex + 1}/{activeQuestions.length}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {(() => {
              const isCorrect = checked && selectedOpt === currentQuestion.correctOptionIndex
              const isWrong = checked && selectedOpt !== null && selectedOpt !== currentQuestion.correctOptionIndex

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
                    <p className="text-sm font-medium text-text leading-relaxed">{currentQuestion.prompt}</p>
                  </div>

                  <div className="space-y-2 pl-9">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const isSelected = selectedOpt === optionIndex
                      const isCorrectOpt = optionIndex === currentQuestion.correctOptionIndex

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
                          key={`${currentIndex}-${optionIndex}`}
                          type="button"
                          onClick={() => handleSelect(optionIndex)}
                          disabled={checked}
                          className={cn(
                            'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-start gap-2.5',
                            optStyle,
                            checked && 'cursor-default'
                          )}
                        >
                          <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {OPTION_LABELS[optionIndex]}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      )
                    })}
                  </div>

                  {checked && isWrong && (
                    <p className="mt-3 ml-9 text-xs text-text-muted italic leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )
            })()}

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
              ) : selectedOpt === currentQuestion.correctOptionIndex ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full rounded-xl py-3 text-sm font-semibold bg-success text-white hover:bg-success/90 transition-colors"
                >
                  {currentIndex + 1 >= activeQuestions.length ? 'Виж резултата' : 'Следващ въпрос →'}
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
                    {currentIndex + 1 >= activeQuestions.length ? 'Виж резултата' : 'Следващ въпрос →'}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {finished && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center py-8">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-6 border-4',
                score >= activeQuestions.length * 0.8
                  ? 'bg-success/10 text-success border-success'
                  : score >= activeQuestions.length * 0.5
                    ? 'bg-amber-100 text-amber-600 border-amber-400'
                    : 'bg-danger/10 text-danger border-danger'
              )}
            >
              {score}/{activeQuestions.length}
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">
              {score >= activeQuestions.length * 0.8
                ? 'Отлично!'
                : score >= activeQuestions.length * 0.5
                  ? 'Добре!'
                  : 'Опитай пак!'}
            </h2>
            <p className="text-text-muted mb-8">
              Верни отговори:{' '}
              <strong className="text-text">{score}</strong> от{' '}
              <strong className="text-text">{activeQuestions.length}</strong>
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
