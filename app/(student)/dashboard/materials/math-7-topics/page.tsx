'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [difficulty, setDifficulty] = useState('')
  const [problemType, setProblemType] = useState('')
  const [query, setQuery] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({})

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
    const normalized = query.trim().toLowerCase()
    return allProblems.filter((problem) => {
      if (topicId && problem.topicId !== topicId) return false
      if (subtopicId && problem.subtopicId !== subtopicId) return false
      if (difficulty && problem.difficulty !== difficulty) return false
      if (problemType && problem.type !== problemType) return false
      if (!normalized) return true

      const searchable = [
        problem.question,
        problem.correctAnswer,
        problem.explanation,
        problem.topicTitle,
        problem.subtopicTitle,
        ...problem.skills,
      ].join(' ').toLowerCase()

      return searchable.includes(normalized)
    })
  }, [difficulty, problemType, query, subtopicId, topicId])

  const allSubtopicCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const problem of allProblems) {
      counts.set(problem.subtopicId, (counts.get(problem.subtopicId) ?? 0) + 1)
    }
    return counts
  }, [])

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
    const isActive = subtopicId === nextSubtopicId
    setTopicId(isActive ? '' : nextTopicId)
    setSubtopicId(isActive ? '' : nextSubtopicId)
    const nextUrl = isActive
      ? '/dashboard/materials/math-7-topics'
      : `/dashboard/materials/math-7-topics?subtopic=${nextSubtopicId}`
    window.history.replaceState(null, '', nextUrl)
    requestAnimationFrame(() => {
      document.getElementById('math-problem-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    if (!window.MathJax?.typesetPromise) return
    const root = document.getElementById('math-problem-list')
    if (!root) return
    window.MathJax.typesetClear?.([root])
    window.MathJax.typesetPromise([root]).catch(() => {})
  }, [filteredProblems, openAnswers, showAnswers])

  function toggleAnswer(problemId: string) {
    setOpenAnswers((prev) => ({ ...prev, [problemId]: !prev[problemId] }))
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Script
        id="mathjax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] },
              startup: { typeset: false }
            };
          `,
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
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

        <section className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5 mb-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            НВО 7. клас · математика
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-text mb-2">
            Задачи по теми и подтеми
          </h1>
          <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
            Оригинални тренировъчни задачи по всички теми от учебния обхват. Филтрирай по тема,
            подтема, трудност или тип задача и преглеждай отговора с кратко решение.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <Stat value={mathTopics.length} label="теми" />
            <Stat value={mathTopics.reduce((sum, topic) => sum + topic.subtopics.length, 0)} label="подтеми" />
            <Stat value={allProblems.length} label="задачи" />
            <Stat value={allProblems.filter((problem) => problem.type === 'short_answer').length} label="кратки отговори" />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-4 md:p-5 mb-5">
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
                  {topicIndex + 1}. {topic.title}
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
                          {subtopic.title}
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

        <section className="rounded-2xl border border-border bg-white p-4 mb-5">
          <div className="grid md:grid-cols-5 gap-3">
            <FilterLabel label="Тема">
              <select
                value={topicId}
                onChange={(event) => {
                  setTopicId(event.target.value)
                  setSubtopicId('')
                }}
                className="input-field"
              >
                <option value="">Всички теми</option>
                {mathTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
            </FilterLabel>

            <FilterLabel label="Подтема">
              <select
                value={subtopicId}
                onChange={(event) => setSubtopicId(event.target.value)}
                className="input-field"
              >
                <option value="">Всички подтеми</option>
                {visibleSubtopics.map((subtopic) => (
                  <option key={subtopic.id} value={subtopic.id}>{subtopic.title}</option>
                ))}
              </select>
            </FilterLabel>

            <FilterLabel label="Трудност">
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="input-field">
                <option value="">Всички</option>
                <option value="easy">Основно</option>
                <option value="medium">Средно</option>
                <option value="exam_ready">Изпитно</option>
              </select>
            </FilterLabel>

            <FilterLabel label="Тип">
              <select value={problemType} onChange={(event) => setProblemType(event.target.value)} className="input-field">
                <option value="">Всички</option>
                <option value="multiple_choice">Избираем отговор</option>
                <option value="short_answer">Кратък отговор</option>
              </select>
            </FilterLabel>

            <FilterLabel label="Търсене">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="напр. проценти, триъгълник"
                className="input-field"
              />
            </FilterLabel>
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              Намерени: <strong className="text-text">{filteredProblems.length}</strong> задачи
            </p>
            <button
              type="button"
              onClick={() => setShowAnswers((value) => !value)}
              className="rounded-xl border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light transition-colors"
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
                      {problem.question}
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
                              <span>{value}</span>
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
                        <p className="mb-2"><strong>Отговор:</strong> {problem.correctAnswer}</p>
                        <p className="mb-2 leading-relaxed"><strong>Решение:</strong> {problem.explanation}</p>
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
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-[#D7E7F7] bg-white p-4">
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs font-semibold text-text-muted">{label}</p>
    </div>
  )
}

function FilterLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-text-muted">
      {label}
      {children}
    </label>
  )
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
