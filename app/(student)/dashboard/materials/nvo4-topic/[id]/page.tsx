'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import {
  nvo4BulgarianMaterials,
  nvo4MathMaterials,
  type Nvo4MaterialItem,
  type Nvo4MaterialLesson,
  type Nvo4MaterialUnit,
} from '@/data/nvo4-generated-materials'
import { cn } from '@/lib/utils'

type Grade4TopicEntry = {
  subject: 'bulgarian' | 'math'
  unit: Nvo4MaterialUnit
  lesson: Nvo4MaterialLesson
  topicNumber: number
}

type Grade4QuizQuestion = {
  prompt: string
  options: string[]
  correctOptionIndex: number
  explanation: string
}

const OPTION_LABELS = ['А', 'Б', 'В', 'Г']

const subjectThemes = {
  bulgarian: {
    label: 'Български език',
    accent: '#8B5CF6',
    headerBg: '#F3EBFF',
    headerBorder: '#E0D0F7',
    outlineBorder: '#CFBDEF',
    outlineHoverBg: '#E4D4FA',
    text: '#5B21B6',
  },
  math: {
    label: 'Математика',
    accent: '#16A34A',
    headerBg: '#E8F8EE',
    headerBorder: '#C3E9CF',
    outlineBorder: '#A9DCB8',
    outlineHoverBg: '#D2EFDB',
    text: '#166534',
  },
} satisfies Record<Grade4TopicEntry['subject'], {
  label: string
  accent: string
  headerBg: string
  headerBorder: string
  outlineBorder: string
  outlineHoverBg: string
  text: string
}>

const nvo4MaterialItemLabels: Record<Nvo4MaterialItem['type'], string> = {
  theory: 'Теория',
  worked_example: 'Пример',
  practice: 'Упражнение',
  quick_check: 'Проверка',
  exam_tip: 'Съвет',
}

const badStrategyOptions = [
  'Избери отговор, без да прочетеш условието докрай.',
  'Пропусни проверката и премини веднага нататък.',
  'Гледай само първата дума и не сравнявай всички данни.',
  'Запиши резултат, без да обясниш как си стигнал до него.',
  'Остави задачата без отговор, ако изглежда по-дълга.',
]

function formatNvo4MaterialText(text: string) {
  return text
    .replace(/\\\(\\square\\\)/g, '□')
    .replace(/\\\(\\cdot\\\)/g, '·')
}

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

function buildGrade4TopicEntries(): Grade4TopicEntry[] {
  const entries: Grade4TopicEntry[] = []

  for (const [subject, tree] of [
    ['bulgarian', nvo4BulgarianMaterials],
    ['math', nvo4MathMaterials],
  ] as const) {
    let topicNumber = 0
    for (const unit of tree.units) {
      for (const lesson of unit.lessons) {
        topicNumber += 1
        entries.push({ subject, unit, lesson, topicNumber })
      }
    }
  }

  return entries
}

function buildQuizQuestions(entry: Grade4TopicEntry): Grade4QuizQuestion[] {
  const practiceItems = entry.lesson.items.filter((item) => item.type === 'practice' || item.type === 'quick_check')

  return practiceItems.map((item, index) => {
    const positiveSteps = item.prompts?.filter(Boolean) ?? []
    const correctOption = positiveSteps[index % positiveSteps.length] ?? 'Първо прочети условието внимателно и запиши данните.'
    const distractors = badStrategyOptions.filter((option) => option !== correctOption).slice(index, index + 3)
    const rawOptions = [correctOption, ...distractors]
    const offset = (entry.topicNumber + index) % rawOptions.length
    const options = rawOptions.map((_, optionIndex) => rawOptions[(optionIndex + offset) % rawOptions.length])

    return {
      prompt: `${formatNvo4MaterialText(item.body)}\nКоя стратегия ще ти помогне най-много?`,
      options,
      correctOptionIndex: options.indexOf(correctOption),
      explanation: `Най-сигурният подход е: ${formatNvo4MaterialText(correctOption)}`,
    }
  })
}

const allGrade4Topics = buildGrade4TopicEntries()

export default function Nvo4TopicPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawId = typeof params.id === 'string' ? params.id : params.id?.[0]
  const id = rawId ? decodeURIComponent(rawId) : undefined
  const viewMode = searchParams.get('view')
  const showTest = viewMode === 'test'
  const showTheory = !showTest
  const topic = allGrade4Topics.find((entry) => entry.lesson.id === id)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)

  if (!topic) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Темата не е намерена" />
        <div className="p-6 text-center text-text-muted">
          <p>Тази тема не съществува.</p>
        </div>
      </div>
    )
  }

  const theme = subjectThemes[topic.subject]
  const theoryItems = topic.lesson.items.filter((item) =>
    item.type === 'theory' || item.type === 'worked_example' || item.type === 'exam_tip'
  )
  const activeQuestions = buildQuizQuestions(topic)
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
    setCurrentIndex(0)
    setSelectedOpt(null)
    setChecked(false)
    setAnswers({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={topic.lesson.title} />

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
          <span className="text-text-muted">4. клас НВО</span>
          <span>/</span>
          <span className="text-text-muted">{theme.label}</span>
          <span>/</span>
          <span className="text-text font-medium">{topic.lesson.title}</span>
        </div>

        <div className="mb-6">
          <div
            className="rounded-sm border p-5 md:p-7 shadow-[8px_8px_0_rgba(30,77,123,0.06)]"
            style={{ backgroundColor: theme.headerBg, borderColor: theme.headerBorder }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: theme.text }}>
              Тема #{topic.topicNumber} · {topic.unit.title}
            </p>
            <h1 className="font-sans text-2xl md:text-3xl font-semibold text-text tracking-normal mb-3 leading-tight">
              {topic.lesson.title}
            </h1>
            <p className="font-sans text-base md:text-lg font-semibold text-text leading-snug tracking-normal">
              {formatNvo4MaterialText(topic.lesson.goal)}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.replace(`/dashboard/materials/nvo4-topic/${id}?view=theory`)}
              className={cn(
                'rounded-lg border py-3 text-center text-sm font-bold transition-colors',
                showTheory
                  ? 'bg-transparent'
                  : 'bg-white text-text-muted'
              )}
              style={{
                borderColor: showTheory ? theme.outlineBorder : theme.headerBorder,
                color: showTheory ? theme.text : undefined,
              }}
            >
              Теория
            </button>
            <button
              type="button"
              onClick={() => router.replace(`/dashboard/materials/nvo4-topic/${id}?view=test`)}
              className={cn(
                'rounded-lg border py-3 text-center text-sm font-bold transition-colors',
                showTest ? 'text-white' : 'bg-white text-text-muted'
              )}
              style={{
                backgroundColor: showTest ? theme.accent : '#ffffff',
                borderColor: showTest ? theme.accent : theme.headerBorder,
              }}
            >
              Тест
            </button>
          </div>
        </div>

        {showTheory && (
          <div className="rounded-2xl border border-border bg-white p-4 md:p-5 mb-6">
            <div className="space-y-4">
              {theoryItems.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: theme.text }}>
                    {nvo4MaterialItemLabels[item.type]} · {item.title}
                  </p>
                  <p className="text-sm leading-relaxed text-text">{formatNvo4MaterialText(item.body)}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {showTest && !finished && currentQuestion && (
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
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
                    backgroundColor: theme.accent,
                  }}
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
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.text }}>
                      Упражнение #{currentIndex + 1}
                    </p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: theme.headerBg, color: theme.text }}
                    >
                      {currentIndex + 1}
                    </span>
                    <p className="whitespace-pre-line text-sm font-medium text-text leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
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
                          <span className="leading-relaxed">{formatNvo4MaterialText(option)}</span>
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
                      ? 'text-white'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  )}
                  style={selectedOpt !== null ? { backgroundColor: theme.accent } : undefined}
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
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: theme.accent }}
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

        {showTest && finished && (
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
              className="w-full max-w-xs rounded-xl py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: theme.accent }}
            >
              Опитай отново
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
