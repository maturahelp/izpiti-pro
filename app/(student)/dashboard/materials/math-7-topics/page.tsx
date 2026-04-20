'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { cn } from '@/lib/utils'
import { fireConfetti } from '@/lib/confetti'
import problemBank from '@/data/nvo_7_math_generated_problem_bank.json'

type Difficulty = 'easy' | 'medium' | 'exam_ready'
type ProblemType = 'multiple_choice' | 'short_answer'

interface MathProblem {
  id: string
  topicId: string
  subtopicId: string
  difficulty: Difficulty
  type: ProblemType
  question: string
  options: Record<string, string> | null
  correctAnswer: string
  explanation: string
  skills: string[]
}

interface MathSubtopic {
  id: string
  title: string
  sourceInspiredBy: { name: string; url: string }[]
  problems: MathProblem[]
}

interface MathTopic {
  id: string
  title: string
  subtopics: MathSubtopic[]
}

const mathTopics = problemBank.topics as MathTopic[]
const allProblems = mathTopics.flatMap((topic) =>
  topic.subtopics.flatMap((subtopic) =>
    subtopic.problems.map((problem) => ({
      ...problem,
      topicTitle: topic.title,
      subtopicTitle: subtopic.title,
      sourceInspiredBy: subtopic.sourceInspiredBy,
    }))
  )
)

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>
      typesetClear?: (elements?: HTMLElement[]) => void
    }
  }
}

export default function Math7TopicsPage() {
  const router = useRouter()
  const [topicId, setTopicId] = useState('')
  const [subtopicId, setSubtopicId] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const [mathJaxReady, setMathJaxReady] = useState(false)

  const visibleSubtopics = useMemo(() => (
    mathTopics
      .filter((topic) => !topicId || topic.id === topicId)
      .flatMap((topic) => topic.subtopics.map((subtopic) => ({
        ...subtopic,
        topicTitle: topic.title,
      })))
  ), [topicId])

  useEffect(() => {
    if (subtopicId && !visibleSubtopics.some((subtopic) => subtopic.id === subtopicId)) {
      setSubtopicId('')
    }
  }, [subtopicId, visibleSubtopics])

  const filteredProblems = useMemo(() => {
    return allProblems.filter((problem) => {
      if (topicId && problem.topicId !== topicId) return false
      if (subtopicId && problem.subtopicId !== subtopicId) return false
      return true
    })
  }, [subtopicId, topicId])

  const allSubtopicCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const problem of allProblems) {
      counts.set(problem.subtopicId, (counts.get(problem.subtopicId) ?? 0) + 1)
    }
    return counts
  }, [])

  const selectedSubtopic = useMemo(() => {
    if (!subtopicId) return null

    for (const topic of mathTopics) {
      const subtopic = topic.subtopics.find((item) => item.id === subtopicId)
      if (subtopic) {
        return {
          ...subtopic,
          topicId: topic.id,
          topicTitle: topic.title,
        }
      }
    }

    return null
  }, [subtopicId])

  useEffect(() => {
    const selectedSubtopicId = new URLSearchParams(window.location.search).get('subtopic')
    if (!selectedSubtopicId) return

    const parentTopic = mathTopics.find((topic) =>
      topic.subtopics.some((subtopic) => subtopic.id === selectedSubtopicId)
    )
    if (!parentTopic) return

    setTopicId(parentTopic.id)
    setSubtopicId(selectedSubtopicId)
  }, [])

  useEffect(() => {
    setCurrentIndex(0)
    setSelectedOpt(null)
    setChecked(false)
    setAnswers({})
    setFinished(false)
  }, [subtopicId])

  function chooseSubtopic(nextTopicId: string, nextSubtopicId: string) {
    setTopicId(nextTopicId)
    setSubtopicId(nextSubtopicId)
    window.history.replaceState(null, '', `/dashboard/materials/math-7-topics?subtopic=${nextSubtopicId}`)
    requestAnimationFrame(() => {
      document.getElementById('math-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function returnToSubtopics() {
    setTopicId('')
    setSubtopicId('')
    window.history.replaceState(null, '', '/dashboard/materials/math-7-topics')
    requestAnimationFrame(() => {
      document.getElementById('math-subtopic-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    if (!window.MathJax?.typesetPromise) return
    const root = document.getElementById('math-workspace')
    if (!root) return
    window.MathJax.typesetClear?.([root])
    window.MathJax.typesetPromise([root]).catch(() => {})
  }, [currentIndex, checked, mathJaxReady])

  function handleSelect(optValue: string) {
    if (checked) return
    setSelectedOpt(optValue)
  }

  function handleCheck() {
    if (selectedOpt === null) return
    const problem = filteredProblems[currentIndex]
    setAnswers((prev) => ({ ...prev, [problem.id]: selectedOpt! }))
    setChecked(true)
    if (selectedOpt === problem.correctAnswer) {
      fireConfetti()
    }
  }

  function handleRevealShortAnswer() {
    setChecked(true)
  }

  function handleRetryQuestion() {
    const problem = filteredProblems[currentIndex]
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[problem.id]
      return next
    })
    setSelectedOpt(null)
    setChecked(false)
  }

  function handleNext() {
    if (currentIndex + 1 >= filteredProblems.length) {
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

  const correctCount = filteredProblems.filter((p) => answers[p.id] === p.correctAnswer).length

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Script
        id="mathjax-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
              },
              startup: { typeset: false },
              options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
            };
          `,
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
          setMathJaxReady(true)
          const root = document.getElementById('math-workspace')
          if (root) window.MathJax?.typesetPromise?.([root])
        }}
      />

      <TopBar title="Математика по теми" />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mb-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/materials')}
            className="hover:text-primary transition-colors"
          >
            Материали
          </button>
          <span>/</span>
          <span className="text-text font-medium">Математика — 7. клас</span>
        </div>

        {!selectedSubtopic && (
        <section id="math-subtopic-grid" className="rounded-2xl border border-border bg-white p-4 md:p-5 mb-5">
          <div className="mb-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Теми и подтеми
            </p>
            <h2 className="text-lg font-bold text-text">
              Избери подтема от квадратчетата
            </h2>
          </div>

          <div className="space-y-7">
            {mathTopics.map((topic, topicIndex) => (
              <section key={topic.id}>
                <h3 className="text-sm md:text-base font-bold text-[#1E4D7B] mb-3">
                  {formatTitleText(`${topicIndex + 1}. ${topic.title}`)}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topic.subtopics.map((subtopic, subtopicIndex) => {
                    const active = subtopic.id === subtopicId
                    return (
                      <button
                        key={subtopic.id}
                        type="button"
                        onClick={() => chooseSubtopic(topic.id, subtopic.id)}
                        className={cn(
                          'min-h-[132px] rounded-lg border p-4 text-left transition-colors',
                          active
                            ? 'border-primary bg-primary-light shadow-sm'
                            : 'border-[#D7E7F7] bg-[#F8FBFF] hover:border-primary/50 hover:bg-primary/5'
                        )}
                      >
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                          Подтема #{subtopicIndex + 1}
                        </p>
                        <h4 className="text-sm font-bold text-text leading-snug">
                          {formatTitleText(subtopic.title)}
                        </h4>
                        <p className="mt-4 text-xs font-semibold text-primary">
                          {allSubtopicCounts.get(subtopic.id) ?? 0} задачи
                        </p>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
        )}

        {selectedSubtopic && (
        <section id="math-workspace" className="rounded-2xl border border-border bg-white p-4 md:p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={returnToSubtopics}
                className="mb-3 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-text-muted hover:border-primary/50 hover:text-primary transition-colors"
              >
                Назад към подтемите
              </button>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                {selectedSubtopic.topicTitle}
              </p>
              <h2 className="text-lg md:text-xl font-bold text-text leading-snug">
                {formatTitleText(selectedSubtopic.title)}
              </h2>
            </div>
          </div>

          {!finished && filteredProblems.length > 0 && (
            <>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                    Въпрос {currentIndex + 1} от {filteredProblems.length}
                  </h2>
                  <span className="text-xs text-text-muted font-semibold">
                    {currentIndex + 1}/{filteredProblems.length}
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / filteredProblems.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question card */}
              {(() => {
                const problem = filteredProblems[currentIndex]
                const isCorrect = checked && selectedOpt === problem.correctAnswer
                const isWrong = checked && selectedOpt !== null && selectedOpt !== problem.correctAnswer

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
                      <p className="text-sm md:text-base font-semibold text-text leading-relaxed">
                        <MathText text={problem.question} mathJaxReady={mathJaxReady} />
                      </p>
                    </div>

                    {problem.type === 'multiple_choice' && problem.options && (
                      <div className="space-y-2 pl-9">
                        {Object.entries(problem.options).map(([label, value]) => {
                          const isSelected = selectedOpt === value
                          const isCorrectOpt = value === problem.correctAnswer

                          let optStyle = 'border-border bg-gray-50 text-text hover:border-primary/40 hover:bg-primary/5'
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
                              key={label}
                              type="button"
                              onClick={() => handleSelect(value)}
                              disabled={checked}
                              className={cn(
                                'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-start gap-2.5',
                                optStyle,
                                checked && 'cursor-default'
                              )}
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current text-[10px] font-bold flex items-center justify-center mt-0.5">
                                {label}
                              </span>
                              <span className="leading-relaxed">
                                <MathText text={value} mathJaxReady={mathJaxReady} />
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {problem.type === 'short_answer' && checked && (
                      <div className="mt-4 rounded-xl border border-[#D7E7F7] bg-[#F8FBFF] p-4 text-sm text-text">
                        <p><strong>Отговор:</strong> <MathText text={problem.correctAnswer} mathJaxReady={mathJaxReady} /></p>
                      </div>
                    )}

                    {checked && isWrong && (
                      <p className="mt-3 pl-9 text-xs text-text-muted italic leading-relaxed">
                        <MathText text={problem.explanation} mathJaxReady={mathJaxReady} />
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {!checked ? (
                  filteredProblems[currentIndex].type === 'short_answer' ? (
                    <button
                      type="button"
                      onClick={handleRevealShortAnswer}
                      className="w-full rounded-xl py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      Виж отговора
                    </button>
                  ) : (
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
                  )
                ) : filteredProblems[currentIndex].type === 'short_answer' ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full rounded-xl py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    {currentIndex + 1 >= filteredProblems.length ? 'Виж резултата' : 'Следващ въпрос →'}
                  </button>
                ) : selectedOpt === filteredProblems[currentIndex].correctAnswer ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full rounded-xl py-3 text-sm font-semibold bg-success text-white hover:bg-success/90 transition-colors"
                  >
                    {currentIndex + 1 >= filteredProblems.length ? 'Виж резултата' : 'Следващ въпрос →'}
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
                      {currentIndex + 1 >= filteredProblems.length ? 'Виж резултата' : 'Следващ въпрос →'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {filteredProblems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-text-muted">
              Няма задачи за избраните филтри.
            </div>
          )}

          {finished && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center py-8">
              <div
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-6 border-4',
                  correctCount >= filteredProblems.length * 0.8
                    ? 'bg-success/10 text-success border-success'
                    : correctCount >= filteredProblems.length * 0.5
                      ? 'bg-amber-100 text-amber-600 border-amber-400'
                      : 'bg-danger/10 text-danger border-danger'
                )}
              >
                {correctCount}/{filteredProblems.length}
              </div>
              <h2 className="text-2xl font-bold text-text mb-2">
                {correctCount >= filteredProblems.length * 0.8
                  ? 'Отлично!'
                  : correctCount >= filteredProblems.length * 0.5
                    ? 'Добре!'
                    : 'Опитай пак!'}
              </h2>
              <p className="text-text-muted mb-8">
                Верни отговори:{' '}
                <strong className="text-text">
                  {correctCount}
                </strong>{' '}
                от <strong className="text-text">{filteredProblems.length}</strong>
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
        </section>
        )}
      </div>
    </div>
  )
}

function MathText({ text, mathJaxReady }: { text: string; mathJaxReady: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!mathJaxReady || !window.MathJax?.typesetPromise || !ref.current) return
    window.MathJax.typesetClear?.([ref.current])
    window.MathJax.typesetPromise([ref.current]).catch(() => {})
  }, [text, mathJaxReady])

  return <span ref={ref}>{text}</span>
}

function formatTitleText(text: string) {
  return text
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\^\\circ/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
}
