'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { cn } from '@/lib/utils'
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

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Основно',
  medium: 'Средно',
  exam_ready: 'Изпитно',
}

const typeLabels: Record<ProblemType, string> = {
  multiple_choice: 'Избираем отговор',
  short_answer: 'Кратък отговор',
}

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
  const [showAnswers, setShowAnswers] = useState(false)
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({})
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

  function chooseSubtopic(nextTopicId: string, nextSubtopicId: string) {
    setTopicId(nextTopicId)
    setSubtopicId(nextSubtopicId)
    setShowAnswers(false)
    setOpenAnswers({})
    window.history.replaceState(null, '', `/dashboard/materials/math-7-topics?subtopic=${nextSubtopicId}`)
    requestAnimationFrame(() => {
      document.getElementById('math-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function returnToSubtopics() {
    setTopicId('')
    setSubtopicId('')
    setShowAnswers(false)
    setOpenAnswers({})
    window.history.replaceState(null, '', '/dashboard/materials/math-7-topics')
    requestAnimationFrame(() => {
      document.getElementById('math-subtopic-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    if (!window.MathJax?.typesetPromise) return
    const root = document.getElementById('math-problem-list')
    if (!root) return
    window.MathJax.typesetClear?.([root])
    window.MathJax.typesetPromise([root]).catch(() => {})
  }, [filteredProblems, openAnswers, showAnswers, mathJaxReady])

  function toggleAnswer(problemId: string) {
    setOpenAnswers((prev) => ({ ...prev, [problemId]: !prev[problemId] }))
  }

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
          const root = document.getElementById('math-problem-list')
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
            <button
              type="button"
              onClick={() => setShowAnswers((value) => !value)}
              className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light transition-colors"
            >
              {showAnswers ? 'Скрий всички отговори' : 'Покажи всички отговори'}
            </button>
          </div>

          <div id="math-problem-list" className="space-y-4">
            {filteredProblems.map((problem, index) => {
              const isOpen = showAnswers || openAnswers[problem.id]
              return (
                <article key={problem.id} className="rounded-2xl border border-border bg-white p-4 md:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{problem.topicTitle}</Badge>
                        <Badge>{problem.subtopicTitle}</Badge>
                        <Badge tone={problem.difficulty}>{difficultyLabels[problem.difficulty]}</Badge>
                        <Badge>{typeLabels[problem.type]}</Badge>
                      </div>
                      <span className="text-xs text-text-muted">{problem.id} · #{index + 1}</span>
                    </div>

                    <p className="text-sm md:text-base font-semibold text-text leading-relaxed mb-4">
                      <MathText text={problem.question} mathJaxReady={mathJaxReady} />
                    </p>

                    {problem.type === 'multiple_choice' && problem.options && (
                      <div className="space-y-2 mb-4">
                        {Object.entries(problem.options).map(([label, value]) => {
                          const isCorrect = isOpen && value === problem.correctAnswer
                          return (
                            <div
                              key={label}
                              className={cn(
                                'rounded-xl border px-3 py-2.5 text-sm',
                                isCorrect
                                  ? 'border-success bg-success/10 text-success font-semibold'
                                  : 'border-border bg-gray-50 text-text'
                              )}
                            >
                              <span className="font-bold mr-2">{label}.</span>
                              <MathText text={value} mathJaxReady={mathJaxReady} />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleAnswer(problem.id)}
                      className="rounded-xl border border-primary/40 bg-primary-light px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
                    >
                      {isOpen ? 'Скрий отговора' : 'Покажи отговора'}
                    </button>

                    {isOpen && (
                      <div className="mt-4 rounded-xl border border-[#D7E7F7] bg-[#F8FBFF] p-4 text-sm text-text">
                        <p className="mb-2"><strong>Отговор:</strong> <MathText text={problem.correctAnswer} mathJaxReady={mathJaxReady} /></p>
                        <p className="mb-2 leading-relaxed"><strong>Решение:</strong> <MathText text={problem.explanation} mathJaxReady={mathJaxReady} /></p>
                        <p className="text-xs text-text-muted">
                          <strong>Умения:</strong> {problem.skills.join(', ')}
                        </p>
                      </div>
                    )}
                  </article>
                )
              })}

              {filteredProblems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-text-muted">
                  Няма задачи за избраните филтри.
                </div>
              )}
            </div>
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

function Badge({ children, tone }: { children: React.ReactNode; tone?: Difficulty }) {
  const toneClass = tone === 'easy'
    ? 'bg-success-light text-success'
    : tone === 'medium'
      ? 'bg-amber-light text-amber'
      : tone === 'exam_ready'
        ? 'bg-danger-light text-danger'
        : 'bg-gray-100 text-text-muted'

  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', toneClass)}>
      {children}
    </span>
  )
}
