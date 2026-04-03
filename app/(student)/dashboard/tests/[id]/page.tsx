'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'
import { tests } from '@/data/tests'
import { MATH_TEXT_OVERRIDES } from '@/data/nvo-math-overrides'
import { QUESTION_IMAGES } from '@/data/nvo-question-images'
import { cn } from '@/lib/utils'
import nvoDataset from '@/data/official_quiz_dataset.json'
import dziDataset from '@/data/official_dzi_bel_dataset.json'
import mockPracticeDataset from '@/data/mock_exam_practice.json'
import { beronExamPayload } from '@/data/beron-tests'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NvoQuestion {
  number: number
  type: 'single_choice' | 'open_response'
  question: string
  options?: Record<string, string>
  correct_option?: string
  official_answer?: string
  answer_guide?: string
  points?: number
  section?: string
}

interface NvoExam {
  id: string
  year: number | string
  subject: string
  published_at: string
  context_text?: string
  context_images?: string[]
  questions: NvoQuestion[]
  source_title?: string
  chart?: {
    title: string
    unit?: string
    labels: string[]
    values: number[]
  }
  exam_type?: 'nvo_bel' | 'dzi_bel'
}

interface MockPracticeExam {
  id: string
  title: string
  exam_type: 'nvo_bel' | 'dzi_bel'
  source_title?: string
  source_text: string
  chart?: {
    title: string
    unit?: string
    labels: string[]
    values: number[]
  }
  questions: Array<{
    number: number
    type: 'single_choice' | 'open_response'
    question: string
    options?: Record<string, string>
    table_rows?: Record<string, string>
    correct_option?: string
    answer_guide?: string | Record<string, string>
    section?: string
  }>
}

interface BeronBankQuestion {
  id: string
  grade: number
  rule_id: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'multiple_choice' | 'choose_correct_form' | 'fill_in_blank' | 'find_the_error' | 'edit_sentence' | 'explain_rule'
  question_text: string
  options?: string[]
  correct_answer: string
  explanation: string
  source_rule_title: string
  tags: string[]
}

interface BeronDifficultyTest {
  id: string
  bank: 'g7' | 'g12'
  bank_label: string
  difficulty: 'easy' | 'medium' | 'hard'
  difficulty_label: string
  title: string
  question_count: number
  topics: string[]
  rule_ids: string[]
  questions: BeronBankQuestion[]
}

type SingleChoiceAnswers = Record<number, string>  // questionNumber → chosen label
type OpenResponses = Record<number, Record<string, string>>  // questionNumber → { label → text }

// ---------------------------------------------------------------------------
// Figure helpers (math geometry questions only)
// ---------------------------------------------------------------------------
const FIGURE_HELPERS: Record<string, Record<number, string>> = {
  '2025_math': { 23: '/figures/figure_2025_math_q23.svg' },
  '2024_math': { 23: '/figures/figure_2024_math_q23.svg' },
  '2023_math': { 23: '/figures/figure_2023_math_q23.svg' },
  '2022_math': { 23: '/figures/figure_2022_math_q23.svg' },
  '2021_math': { 23: '/figures/figure_2021_math_q23.svg' },
  '2020_math': { 23: '/figures/figure_2020_math_q23.svg' },
  '2019_math': { 23: '/figures/figure_2019_math_q23.svg' },
  '2018_math': { 24: '/figures/figure_2018_math_q24.svg' },
}

// ---------------------------------------------------------------------------
// Utility: text normalisation (ported from app.js)
// ---------------------------------------------------------------------------
function normalizeMathText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\s+ПО МАТЕМАТИКА[\s\S]*$/u, '')
    .replace(/\uf040/g, '≅')
    .replace(/\uf050/g, '∥')
    .replace(/\uf0a3/g, '≤')
    .replace(/\uf0ae/g, '→')
    .replace(/\uf0b9/g, '≠')
    .replace(/\uf0c7/g, '∩')
    .replace(/\uf0d7/g, '·')
    .replace(/([A-Za-zА-Яа-я])△([A-Za-zА-Яа-я]{1,3})/g, '$1 ∈ $2')
    .replace(/∑/g, '∠')
    .replace(/\u0002/g, '→')
    .replace(/\u0003/g, '∥')
    .replace(/\u0004/g, '≠')
    .replace(/\b([A-ZА-Я]{3})\s*:\s*([A-ZА-Я]{3})\s*:\s*([A-ZА-Я]{3})/g, '∠$1: ∠$2: ∠$3')
    .replace(/\b([A-ZА-Я]{3})\s*:\s*([A-ZА-Я]{3})(?=\s*=\s*[\d:])/g, '∠$1: ∠$2')
    .replace(/\b([A-ZА-Я]{3})(?==\s*\d+\s*°)/g, '∠$1')
    .replace(/\b([A-ZА-Я]{3})(?==\s*\d+°)/g, '∠$1')
    .replace(/права\s+([a-zа-я])\s+([A-ZА-Я]{2})/g, 'права $1 ∥ $2')
    .replace(/(?:\s*∠){2,}(?=\s*лежи)/g, '')
    .replace(/\s*∥\s*∥(?=\s*Намерете)/g, '')
    .replace(/∠\s*(?=[A-ZА-Я]{1,2}\b)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/…/g, '...')
    .trim()
}

function collapseQuestionText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    // Preserve explicit blank lines / subquestion markers, but join PDF-broken line wraps.
    .replace(/([^\n])\n(?!\n|[АБВГД])(?=\S)/g, '$1 ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function stripExamBoilerplate(text: string): string {
  if (!text) return ''
  return text
    .replace(/МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО И НАУКАТА\s*/g, '')
    .replace(/ДЪРЖАВЕН ЗРЕЛОСТЕН ИЗПИТ ПО БЪЛГАРСКИ ЕЗИК И ЛИТЕРАТУРА\s*/g, '')
    .replace(/\b\d{1,2}\s+[а-яА-Я]+\s+\d{4}\s+година\s*/g, '')
    .replace(/ЧАСТ\s*[12]\s*\(Време за работа:\s*\d+\s*минути\)\s*/g, '')
    .replace(/Отговорите на задачите от \d+\. до \d+\. включително отбелязвайте в листа за отговори\.\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function cleanOfficialAnswer(text: string | undefined, questionType: string): string {
  if (!text) return ''
  let cleaned = normalizeMathText(text)
    .replace(/^(Примерни отговори:)\s*\d+\s*/i, '$1 ')
    .replace(/^(Възможни отговори:)\s*\d+\s*/i, '$1 ')
    .replace(/\uf0b7/g, '•')
    .replace(/_/g, ' ')
    .replace(/([А-Я]\)\s*\d+)\s+\d+\s+(?=[А-Я]\))/g, '$1 ')
    .replace(/([^\d])\s+\d+\s+(?=[А-Я]\))/g, '$1 ')
    .replace(/([А-Яа-яA-Za-z„""«»])\s+\d+\s+(?=[А-Яа-яA-Za-z„""«»])/g, '$1 ')
    .replace(/\b(?:Общо|Всичко):?\s*\d+(?:,\d+)?\s*т\.?.*$/gi, '')
    .replace(/\b(?:по\s+\d+(?:,\d+)?\s*т\.?.*)$/gi, '')
    .replace(/\b(\d+(?:,\d+)?)\s*точки?\b.*$/gi, '')
    .replace(/\b(\d+(?:,\d+)?)\s*т\.?\b.*$/gi, '')
    .replace(/^(Например:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/^(Примерни (?:насоки|посоки)(?: за размисъл)?:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/^(Възможни? отговори?:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/^(Възможен отговор:)\s*\d+(?:,\d+)?\s*/i, '$1 ')
    .replace(/\s+\d+(?:,\d+)?\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (questionType !== 'single_choice') {
    cleaned = cleaned
      .replace(/(?<=[А-Яа-яA-Za-z"»""\)])\s+\d+(?:,\d+)?\s+(?=[а-яa-z])/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }
  return cleaned
}

function normalizeOpenAnswer(text: string): string {
  return normalizeMathText(text || '')
    .toLowerCase()
    .replace(/["„""«»]/g, '')
    .replace(/[.,!?;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractAlternatives(cleaned: string): string[] {
  if (!cleaned) return []
  return cleaned
    .replace(/^Например:\s*/i, '')
    .replace(/^Възможни? отговори?:\s*/i, '')
    .replace(/^Възможен отговор:\s*/i, '')
    .split(/\s*\/\s*|\s*;\s*|\s+или\s+/i)
    .map((p) => normalizeOpenAnswer(p))
    .filter(Boolean)
}

function isManualCheck(cleaned: string): boolean {
  if (!cleaned) return true
  return /примерни|насоки|посоки|размисъл|докажете|редактирана|грешка|текстът|изречение|съчувствие|ролята на|например:/i.test(cleaned)
}

function getOpenResponseLabels(question: NvoQuestion): string[] {
  if (question.type === 'open_response' && question.options) {
    return Object.keys(question.options)
  }
  const text = normalizeMathText(question.question || '')
  const matches = [...text.matchAll(/(^|[.!?:;]\s*)([АБВГД])\)/g)]
  const labels = matches.map((m) => m[2])
  return [...new Set(labels)]
}

function splitContextText(exam: NvoExam): { intro: string; body: string } {
  const text = (exam.context_text || '').trim()
  if (!text || !exam.subject.includes('Български')) return { intro: '', body: text }

  let remaining = text
  const introParts: string[] = []
  const introPatterns = [
    /^Отговорите на задачите от 1\. до 25\. включително отбелязвайте в листа за отговори\.\s*/i,
    /^Прочетете текста, запознайте се с данните от анкетата и отговорете на въпросите от 1\. до 16\. включително\.\s*/i,
    /^Прочетете текста, разгледайте таблицата и изпълнете задачите от 1\. до 16\. включително\.\s*/i,
    /^Прочетете текста, запознайте се със съдържанието на таблицата и изпълнете задачите от 1\. до 16\. включително\.\s*/i,
    /^Прочетете текста и разгледайте таблицата, за да изпълните задачите от 1\. до 16\. включително\.\s*/i,
    /^Прочетете текста и коментарите в една социална мрежа, за да изпълните задачите от 1\. до 16\. включително\.\s*/i,
    /^Прочетете текста, запознайте се със съдържанието на таблицата и изпълнете от 1\. до 16\. задача включително\.\s*/i,
    /^Запознайте се с текста и диаграмата и изпълнете задачите към тях \(от 14\. до 21\.\s*включително\)\.\s*/i,
    /^Запознайте се с текста и таблицата и изпълнете задачите към тях \(от 14\. до 21\.\s*включително\)\.\s*/i,
  ]

  let matched = true
  while (matched) {
    matched = false
    for (const pattern of introPatterns) {
      const hit = remaining.match(pattern)
      if (hit) {
        introParts.push(hit[0].trim())
        remaining = remaining.slice(hit[0].length).trim()
        matched = true
        break
      }
    }
  }

  return { intro: introParts.join(' '), body: remaining }
}

// ---------------------------------------------------------------------------
// Map izpiti-pro test ID → dataset exam ID
// ---------------------------------------------------------------------------
function mapTestId(testId: string): string {
  const m = testId.match(/^nvo-(bel|math)-(\d{4})$/)
  if (m) return `${m[2]}_${m[1]}`

  const dzi = testId.match(/^dzi-bel-(\d{4})-(may|aug|june)$/)
  if (dzi) {
    const sessionMap: Record<string, string> = { may: 'may', aug: 'aug', june: 'june' }
    return `dzi_bel_${dzi[1]}_${sessionMap[dzi[2]]}`
  }

  return testId
}

function normalizeMockExam(exam: MockPracticeExam): NvoExam {
  const isNvo = exam.exam_type === 'nvo_bel'

  return {
    id: exam.id,
    year: '',
    subject: isNvo ? 'Български език' : 'Български език и литература',
    published_at: '',
    context_text: exam.source_text,
    context_images: [],
    source_title: exam.source_title || exam.title,
    chart: exam.chart,
    exam_type: exam.exam_type,
    questions: exam.questions.map((question) => {
      const rawGuide = question.answer_guide
      const guideStr =
        rawGuide == null
          ? undefined
          : typeof rawGuide === 'string'
            ? rawGuide
            : Object.entries(rawGuide)
                .map(([k, v]) => `${k}) ${v}`)
                .join('\n')
      return {
        number: question.number,
        type: question.type,
        question: question.question,
        options: question.options ?? question.table_rows,
        correct_option: question.correct_option,
        official_answer: guideStr,
        answer_guide: guideStr,
        section: question.section,
      }
    }),
  }
}

function normalizeBeronExam(test: BeronDifficultyTest): NvoExam {
  const optionLabels = ['А', 'Б', 'В', 'Г', 'Д', 'Е']
  const isGrade7 = test.bank === 'g7'

  const sourceText = [
    `Този BERON тест е съставен по правилата за ${test.bank_label.toLowerCase()} и е подреден на ниво „${test.difficulty_label.toLowerCase()}“ трудност.`,
    `Основни теми: ${test.topics.join(', ')}.`,
    `Използвай въпросите за целенасочен преговор по правопис, пунктуация и граматични норми.`,
  ].join('\n\n')

  return {
    id: `beron_${test.id}`,
    year: '',
    subject: isGrade7 ? 'Български език' : 'Български език и литература',
    published_at: '',
    context_text: sourceText,
    context_images: [],
    source_title: 'BERON — Правила за правопис и пунктуация',
    exam_type: isGrade7 ? 'nvo_bel' : 'dzi_bel',
    questions: test.questions.map((question, index) => {
      const hasOptions = Boolean(question.options?.length)
      const options = hasOptions
        ? Object.fromEntries((question.options || []).map((option, optionIndex) => [optionLabels[optionIndex] || String(optionIndex + 1), option]))
        : undefined

      const correctOption = hasOptions
        ? Object.entries(options || {}).find(([, value]) => value === question.correct_answer)?.[0]
        : undefined

      return {
        number: index + 1,
        type: hasOptions ? 'single_choice' : 'open_response',
        question: question.question_text,
        options,
        correct_option: correctOption,
        official_answer: question.correct_answer,
        answer_guide: `${question.explanation}\n\nВерен отговор: ${question.correct_answer}`,
        section: question.topic,
      }
    }),
  }
}

const OFFICIAL_EXAMS: NvoExam[] = [
  ...(nvoDataset as unknown as NvoExam[]),
  ...(dziDataset as unknown as NvoExam[]),
]

const MOCK_EXAMS: NvoExam[] = (mockPracticeDataset as { exams: MockPracticeExam[] }).exams.map(normalizeMockExam)
const BERON_EXAMS: NvoExam[] = beronExamPayload.tests.map(normalizeBeronExam)

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function TestPage() {
  const params = useParams()
  const testId = String(params.id)
  const test = tests.find((t) => t.id === testId) || tests[0]
  const datasetId = mapTestId(test.id)
  const exam = [...OFFICIAL_EXAMS, ...MOCK_EXAMS, ...BERON_EXAMS].find((e) => e.id === datasetId) ?? null
  const storageKey = `izpiti-pro:test:${test.id}:state:v1`

  const [answers, setAnswers] = useState<SingleChoiceAnswers>({})
  const [openResponses, setOpenResponses] = useState<OpenResponses>({})
  const [submitted, setSubmitted] = useState(false)
  const [revealAnswers, setRevealAnswers] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)
  const [contextMediaCollapsed, setContextMediaCollapsed] = useState(false)

  // Inject MathJax on mount, retrigger after state changes
  useEffect(() => {
    const w = window as unknown as {
      MathJax?: { typesetPromise?: () => Promise<void>; startup?: { promise: Promise<void> } }
    }
    if (!document.getElementById('mathjax-script')) {
      const script = document.createElement('script')
      script.id = 'mathjax-script'
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
      script.async = true
      ;(window as unknown as { MathJax: object }).MathJax = {
        tex: { inlineMath: [['\\(', '\\)'], ['$', '$']] },
        svg: { fontCache: 'global' },
      }
      document.head.appendChild(script)
    } else if (w.MathJax?.typesetPromise) {
      w.MathJax.typesetPromise()
    }
  }, [submitted, revealAnswers, answers])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        setAnswers({})
        setOpenResponses({})
        setSubmitted(false)
        setRevealAnswers(false)
        return
      }

      const saved = JSON.parse(raw) as {
        answers?: SingleChoiceAnswers
        openResponses?: OpenResponses
        submitted?: boolean
        revealAnswers?: boolean
      }

      setAnswers(saved.answers || {})
      setOpenResponses(saved.openResponses || {})
      setSubmitted(Boolean(saved.submitted))
      setRevealAnswers(Boolean(saved.revealAnswers))
    } catch {
      setAnswers({})
      setOpenResponses({})
      setSubmitted(false)
      setRevealAnswers(false)
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify({
      answers,
      openResponses,
      submitted,
      revealAnswers,
    }))
  }, [answers, openResponses, submitted, revealAnswers, storageKey])

  const handleReset = useCallback(() => {
    setAnswers({})
    setOpenResponses({})
    setSubmitted(false)
    setRevealAnswers(false)
    setContextCollapsed(false)
    setContextMediaCollapsed(false)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  if (!exam) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title={test.title} />
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          <div className="card p-8 text-center">
            <p className="text-text-muted">Тестът не е намерен в базата данни.</p>
          </div>
        </div>
      </div>
    )
  }

  const selectableQuestions = exam.questions.filter((q) => q.type === 'single_choice')
  const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)]).length
  const totalSelectable = selectableQuestions.length

  const score = (() => {
    const correct = selectableQuestions.filter((q) => answers[q.number] === q.correct_option).length
    return {
      correct,
      total: totalSelectable,
      percent: totalSelectable ? Math.round((correct / totalSelectable) * 100) : 0,
    }
  })()

  const contextParts = splitContextText(exam)
  const hasContext = Boolean(exam.context_text)
  const hasMedia = Boolean(exam.context_images?.length)
  const hasChart = Boolean(exam.chart?.labels?.length)
  const totalQuestions = exam.questions.length

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={test.title} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        {/* Score + actions bar */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-4',
              !submitted && !revealAnswers
                ? 'border-gray-200 text-text-muted'
                : score.percent >= 80
                ? 'border-green-400 text-green-700'
                : score.percent >= 60
                ? 'border-amber-400 text-amber-700'
                : 'border-red-400 text-red-700'
            )}>
              {submitted || revealAnswers ? `${score.percent}%` : '—'}
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">Напредък</p>
              <p className="text-sm font-semibold text-text">{answeredCount} / {totalSelectable} тестови отговорени</p>
              <p className="text-xs text-text-muted">{totalQuestions} въпроса общо</p>
              {(submitted || revealAnswers) && (
                <p className="text-xs text-text-muted">{score.correct} верни от {score.total}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubmitted(true)}
              className="btn-primary text-sm px-4 py-2"
            >
              Провери отговорите
            </button>
            <button
              onClick={() => setRevealAnswers((v) => !v)}
              className="btn-secondary text-sm px-4 py-2"
            >
              {revealAnswers ? 'Скрий ключа' : 'Покажи ключа'}
            </button>
            <button onClick={handleReset} className="btn-secondary text-sm px-4 py-2">
              Изчисти
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card px-4 py-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: totalSelectable ? `${Math.round((answeredCount / totalSelectable) * 100)}%` : '0%' }}
            />
          </div>
        </div>

        {/* Context panel */}
        {hasContext && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
                {exam.subject.includes('Български') ? 'Изходен текст и указания' : 'Текст към изпита'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setContextCollapsed((v) => !v)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {contextCollapsed ? 'Покажи текста' : 'Скрий текста'}
                </button>
                {hasMedia && (
                  <button
                    onClick={() => setContextMediaCollapsed((v) => !v)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    {contextMediaCollapsed ? 'Покажи инфографиката' : 'Скрий инфографиката'}
                  </button>
                )}
              </div>
            </div>
            {!contextCollapsed && (
              <div className="p-5 space-y-3">
                {contextParts.intro && (
                  <div className="px-3 py-2 rounded-lg bg-primary-light border border-primary/20 text-xs font-semibold text-primary leading-relaxed">
                    {contextParts.intro}
                  </div>
                )}
                {exam.source_title && (
                  <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {exam.source_title}
                  </div>
                )}
                {contextParts.body && (
                  <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{contextParts.body}</p>
                )}
                {hasChart && <ChartCard chart={exam.chart!} />}
              </div>
            )}
            {hasMedia && !contextCollapsed && !contextMediaCollapsed && (
              <div className="px-5 pb-5 space-y-3">
                {(exam.context_images || []).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <figure key={i} className="m-0 rounded-xl overflow-x-auto border border-border bg-white">
                    <img
                      src={src}
                      alt={`Илюстрация ${i + 1}`}
                      className="block w-auto min-w-full max-w-none h-auto rounded-xl"
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Questions */}
        {revealAnswers && (
          <div className="card p-4 border border-amber-200 bg-amber-50/70">
            <p className="text-sm font-semibold text-amber-800">Ключът за отговори е видим.</p>
            <p className="text-xs text-amber-700 mt-1">
              При тестовите въпроси се показва верният избор, а при свободните отговори можеш да свериш отговора си с насоките под задачата.
            </p>
          </div>
        )}
        <div className="space-y-5">
          {exam.questions.map((q) => (
            <QuestionCard
              key={q.number}
              exam={exam}
              question={q}
              answers={answers}
              openResponses={openResponses}
              submitted={submitted}
              revealAnswers={revealAnswers}
              onAnswer={(num, val) => setAnswers((prev) => ({ ...prev, [num]: val }))}
              onOpenResponse={(num, label, val) =>
                setOpenResponses((prev) => ({
                  ...prev,
                  [num]: { ...(prev[num] || {}), [label]: val },
                }))
              }
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/dashboard/tests" className="btn-secondary">
            Обратно към тестовете
          </Link>
          <button onClick={handleReset} className="btn-primary">
            Опитай отново
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QuestionCard
// ---------------------------------------------------------------------------
function QuestionCard({
  exam,
  question,
  answers,
  openResponses,
  submitted,
  revealAnswers,
  onAnswer,
  onOpenResponse,
}: {
  exam: NvoExam
  question: NvoQuestion
  answers: SingleChoiceAnswers
  openResponses: OpenResponses
  submitted: boolean
  revealAnswers: boolean
  onAnswer: (num: number, val: string) => void
  onOpenResponse: (num: number, label: string, val: string) => void
}) {
  const isMath = exam.subject === 'Математика'
  const override = MATH_TEXT_OVERRIDES[exam.id]?.[question.number]
  const figureHref = FIGURE_HELPERS[exam.id]?.[question.number]
  const questionImageSrc = QUESTION_IMAGES[exam.id]?.[question.number]

  const showFeedback = submitted || revealAnswers
  const chosen = answers[question.number]
  const isChoiceCorrect = chosen === question.correct_option

  const cardBorder =
    showFeedback && question.type === 'single_choice'
      ? isChoiceCorrect
        ? 'border-green-300'
        : chosen
        ? 'border-red-300'
        : 'border-border'
      : question.type === 'open_response'
      ? 'border-dashed border-border'
      : 'border-border'

  // Question text
  let questionContent: React.ReactNode
  if (override?.questionHtml) {
    questionContent = <span dangerouslySetInnerHTML={{ __html: override.questionHtml }} />
  } else if (isMath && question.type === 'open_response') {
    const formatted = stripExamBoilerplate(collapseQuestionText(normalizeMathText(question.question || '')))
      .replace(/([.!?:;])\s*([АБВГД])\)/g, '$1\n\n$2)')
      .replace(/^([АБВГД])\)/gm, '$1)')
    const parts = formatted.split('\n\n').filter(Boolean)
    questionContent = (
      <>
        {parts.map((part, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{part}</p>)}
      </>
    )
  } else if (isMath) {
    questionContent = <span>{stripExamBoilerplate(collapseQuestionText(normalizeMathText(question.question || '')))}</span>
  } else {
    const parts = stripExamBoilerplate(normalizeMathText(question.question || '')).split('\n\n').filter(Boolean)
    questionContent = (
      <>
        {parts.map((part, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{part}</p>)}
      </>
    )
  }

  const openState = openResponses[question.number] || {}
  const labels = getOpenResponseLabels(question)
  const effectiveLabels = labels.length ? labels : ['Отговор']

  const openEval = (() => {
    if (question.type !== 'open_response') return null
    const cleaned = cleanOfficialAnswer(question.official_answer, question.type)
    const filledEntries = effectiveLabels.filter((l) => (openState[l] || '').trim())
    if (!filledEntries.length) return { mode: 'empty' as const, cleaned }
    if (isManualCheck(cleaned)) return { mode: 'manual' as const, cleaned }
    if (labels.length <= 1) {
      const variants = extractAlternatives(cleaned)
      const userNorm = normalizeOpenAnswer(openState[effectiveLabels[0]] || '')
      const correct = variants.some((v) => v && userNorm === v)
      return { mode: correct ? 'correct' as const : 'incorrect' as const, cleaned }
    }
    return { mode: 'manual' as const, cleaned }
  })()

  return (
    <div className={cn('card p-5 border-2', cardBorder)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold text-primary-dark">Въпрос {question.number}</span>
        <span className={cn(
          'text-xs font-bold px-2 py-1 rounded-full',
          question.type === 'open_response'
            ? 'bg-amber-50 text-amber-700'
            : chosen
            ? 'bg-primary-light text-primary'
            : 'bg-gray-100 text-text-muted'
        )}>
          {question.type === 'open_response'
            ? `Свободен отговор`
            : chosen
            ? `Избрано: ${chosen}`
            : 'Неотговорен'}
        </span>
      </div>

      {/* Question text */}
      <div className="text-sm font-medium text-text leading-relaxed mb-4">
        {questionContent}
      </div>

      {/* PDF figure image */}
      {questionImageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <figure className="my-3 m-0">
          <img
            src={questionImageSrc}
            alt={`Фигура към въпрос ${question.number}`}
            className="block max-w-full h-auto rounded-xl border border-border bg-white"
            loading="lazy"
            style={{ maxHeight: '480px', width: 'auto' }}
          />
        </figure>
      )}

      {/* Figure link */}
      {figureHref && (
        <div className="mb-4 flex flex-wrap items-center gap-3 p-3 rounded-xl border border-dashed border-border bg-white/60">
          <a
            href={figureHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-light text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Отвори фигурата
          </a>
          <span className="text-xs text-text-muted">Помощна фигура към условието — отваря се при нужда.</span>
        </div>
      )}

      {/* Single choice options */}
      {question.type === 'single_choice' && question.options && (
        <div className="space-y-2 pl-0">
          {Object.entries(question.options).map(([label, text]) => {
            const isSelected = chosen === label
            const isCorrect = label === question.correct_option
            const showCorrect = showFeedback && isCorrect
            const showWrong = showFeedback && isSelected && !isCorrect

            let optText: React.ReactNode = normalizeMathText(text || 'Избор по изображение')
            if (override?.optionsHtml?.[label]) {
              optText = <span dangerouslySetInnerHTML={{ __html: override.optionsHtml[label] }} />
            }

            return (
              <label
                key={label}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium',
                  showCorrect
                    ? 'border-green-400 bg-green-50 text-green-800'
                    : showWrong
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : isSelected
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border bg-white text-text hover:border-primary/40 hover:bg-gray-50'
                )}
              >
                <input
                  type="radio"
                  name={`q-${exam.id}-${question.number}`}
                  value={label}
                  checked={isSelected}
                  onChange={() => onAnswer(question.number, label)}
                  className="mt-0.5 flex-shrink-0"
                />
                <span className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
                  showCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : showWrong
                    ? 'border-red-500 bg-red-500 text-white'
                    : isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-border text-text-muted'
                )}>
                  {label}
                </span>
                <span className="leading-relaxed">{optText}</span>
                {showCorrect && <span className="ml-auto text-green-600">✓</span>}
                {showWrong && <span className="ml-auto text-red-600">✗</span>}
              </label>
            )
          })}
        </div>
      )}

      {/* Open response fields */}
      {question.type === 'open_response' && (
        <div className="space-y-3">
          {question.options && Object.entries(question.options).map(([label, text]) => (
            <div key={label} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-gray-50 text-sm text-text-muted">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{label}</span>
              <span>{normalizeMathText(text)}</span>
            </div>
          ))}
          <div className="space-y-3">
            {effectiveLabels.map((label) => {
              const val = openState[label] || ''
              const isCorrect = openEval?.mode === 'correct'
              const isIncorrect = openEval?.mode === 'incorrect'
              return (
                <div key={label} className="grid gap-1.5">
                  <label className="text-xs font-bold text-amber-700">
                    {labels.length ? `${label}) Твоят отговор` : 'Твоят отговор'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={labels.length ? `Запиши решението за ${label})` : 'Запиши своя отговор'}
                    value={val}
                    onChange={(e) => onOpenResponse(question.number, label, e.target.value)}
                    className={cn(
                      'w-full resize-y border rounded-xl px-3 py-2 text-sm font-medium text-text bg-white focus:outline-none focus:ring-2',
                      isCorrect
                        ? 'border-green-400 bg-green-50 focus:ring-green-200'
                        : isIncorrect
                        ? 'border-red-300 bg-red-50 focus:ring-red-200'
                        : 'border-border focus:ring-primary/20'
                    )}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && <FeedbackBox question={question} answers={answers} openEval={openEval} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChartCard
// ---------------------------------------------------------------------------

function ChartCard({
  chart,
}: {
  chart: NonNullable<NvoExam['chart']>
}) {
  const max = Math.max(...chart.values, 1)

  return (
    <div className="mt-2 rounded-xl border border-border bg-[#FCFBF7] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text">{chart.title}</h3>
        {chart.unit && (
          <p className="text-xs text-text-muted mt-1">Стойности в {chart.unit}</p>
        )}
      </div>
      <div className="space-y-3">
        {chart.labels.map((label, index) => {
          const value = chart.values[index] ?? 0
          const width = `${Math.max(8, Math.round((value / max) * 100))}%`

          return (
            <div key={`${label}-${index}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-text">{label}</span>
                <span className="font-semibold text-primary">{value}{chart.unit || ''}</span>
              </div>
              <div className="h-3 rounded-full bg-white border border-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400"
                  style={{ width }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeedbackBox
// ---------------------------------------------------------------------------
function FeedbackBox({
  question,
  answers,
  openEval,
}: {
  question: NvoQuestion
  answers: SingleChoiceAnswers
  openEval: { mode: 'empty' | 'correct' | 'incorrect' | 'manual'; cleaned: string } | null
}) {
  if (question.type === 'single_choice') {
    const chosen = answers[question.number]
    const correct = chosen === question.correct_option
    return (
      <div className={cn(
        'mt-3 px-3 py-2 rounded-lg text-xs font-medium',
        correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      )}>
        {chosen ? `Твоят избор: ${chosen}.` : 'Нямаш избран отговор.'}{' '}
        {correct
          ? `Отлично. Верен отговор: ${question.correct_option}.`
          : `Верен отговор: ${question.correct_option}.`}
      </div>
    )
  }

  if (!openEval) return null
  const { mode, cleaned } = openEval

  if (mode === 'empty') {
    return cleaned ? (
      <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
        <strong>Официален отговор:</strong><br />
        <span className="whitespace-pre-wrap">{formatStructuredAnswer(cleaned)}</span>
      </div>
    ) : null
  }

  if (mode === 'correct') {
    return (
      <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700">
        <strong>Верен отговор.</strong> Официален отговор:<br />
        <span className="whitespace-pre-wrap">{formatStructuredAnswer(cleaned)}</span>
      </div>
    )
  }

  if (mode === 'incorrect') {
    return (
      <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700">
        <strong>Отговорът не съвпада с официалния.</strong> Официален отговор:<br />
        <span className="whitespace-pre-wrap">{formatStructuredAnswer(cleaned)}</span>
      </div>
    )
  }

  // manual
  return (
    <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
      {cleaned ? (
        <><strong>Свери отговора си с официалния:</strong><br />
        <span className="whitespace-pre-wrap">{formatStructuredAnswer(cleaned)}</span></>
      ) : 'Задача със свободен отговор или писмена работа.'}
    </div>
  )
}

function formatStructuredAnswer(text: string): string {
  return text
    .replace(/([.!?:;])\s*([АБВГД])\)/g, '$1\n$2)')
    .replace(/^([АБВГД])\)/gm, '$1)')
}
