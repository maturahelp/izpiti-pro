'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'
import Confetti from '@/components/ui/confetti'
import { studentTests as tests } from '@/data/student-content'
import { MATH_TEXT_OVERRIDES } from '@/data/nvo-math-overrides'
import { getMockNvoMathFigure } from '@/data/nvo-math-figure-assets'
import { QUESTION_IMAGES } from '@/data/nvo-question-images'
import { cn } from '@/lib/utils'
import { saveDziAttempt } from '@/lib/progress'
import { logActivity } from '@/lib/activity-log'
import { allTests } from '@/data/tests'
// Self-contained confetti — pure DOM/JS, no external library. Spawns 70
// colored particles bursting from mid-screen with simple physics (velocity,
// gravity, drag) and removes itself when all particles fade.
function fireBurstConfetti() {
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
      el, x: 0, y: 0,
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
import { buildUnderlinedWordQuestion } from '@/lib/underlined-word-question'
import {
  buildDziMatchingAnswerGuide,
  buildDziMatchingQuestionModel,
  evaluateDziMatchingQuestion,
} from '@/lib/dzi-matching-question'
import nvoDataset from '@/data/official_quiz_dataset.json'
import dziDataset from '@/data/official_dzi_bel_dataset.json'
import mockPracticeDataset from '@/data/mock_exam_practice.json'
import mockMathPracticeDataset from '@/data/mock_math_exam_practice.json'
import { beronExamPayload, beronTests } from '@/data/beron-tests'
import {
  generatedEnglishMaterialSections,
  type GeneratedEnglishQuestion,
} from '@/lib/english-generated-materials'
import { officialEnglishMockExams } from '@/lib/official-english-mock-data'
import { EnglishDziTestView } from '@/components/dashboard/EnglishDziTestView'
import { createClient } from '@/lib/supabase/client'
import { hasActivePremium } from '@/lib/subscription-access'

// ---------------------------------------------------------------------------
// Freemium past-exam gating
// ---------------------------------------------------------------------------
// Past DZI/NVO exams are freemium: the first FREE_PAST_EXAM_QUESTIONS questions
// are visible to free users; the rest is blurred behind a premium upsell.
const FREE_PAST_EXAM_QUESTIONS = 3

function isPastExamId(id: string): boolean {
  if (id.startsWith('mock_')) return false
  if (id.startsWith('selected_mock_')) return false
  if (id.startsWith('english-generated-')) return false
  if (/^q\d+$/i.test(id)) return false
  return true
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NvoQuestion {
  number: number
  type: 'single_choice' | 'open_response'
  question: string
  options?: Record<string, string>
  pairs?: Record<string, string>
  correct_option?: string
  official_answer?: string
  answer_guide?: string
  question_image?: string
  task_condition?: string
  points?: number
  section?: string
  source_tags?: {
    source_id?: string
    official_year?: string
    topic_bucket?: string
  }
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
  exam_type?: 'nvo_bel' | 'dzi_bel' | 'nvo_math' | 'dzi_math' | 'dzi_english'
}

interface MockPracticeExam {
  id: string
  title: string
  exam_type: 'nvo_bel' | 'dzi_bel' | 'nvo_math' | 'dzi_math'
  source_title?: string
  source_text?: string
  topic_focus?: string[]
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
    pairs?: Record<string, string>
    table_rows?: Record<string, string>
    correct_option?: string
    answer_guide?: string | Record<string, string>
    section?: string
    source_tags?: {
      source_id?: string
      official_year?: string
      topic_bucket?: string
    }
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

const SHARED_Q19_Q20_TASK_CONDITION =
  'За задачи 19. и 20. в листа за отговори запишете буквата на въпроса и Вашия отговор срещу нея.'

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

function cleanMathChoiceText(text: string): string {
  if (!text) return ''
  return normalizeMathText(text)
    .replace(SHARED_Q19_Q20_TASK_CONDITION, '')
    .replace(/За задачи 19\. и 20\.[\s\S]*?срещу нея\.?/u, '')
    .replace(/\s+ПО МАТЕМАТИКА[\s\S]*$/u, '')
    .replace(/\s+\d+\s+инозес\s+имибюл\s+йорБ[\s\S]*$/u, '')
    .replace(/\s+\d+\s+етищетобар\s+ан\s+йорБ[\s\S]*$/u, '')
    .replace(/\s+\d+\s+итуним\s+в\s+емерВ[\s\S]*$/u, '')
    .replace(/\s+Видове изпълнения\s*$/u, '')
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

function getOpenResponseConfig(
  exam: NvoExam,
  question: NvoQuestion,
): { labels: string[]; input: 'text' | 'textarea'; rows?: number; placeholder?: string } {
  const parsedLabels = getOpenResponseLabels(question)
  if (parsedLabels.length) {
    return {
      labels: parsedLabels,
      input: 'textarea',
      rows: 2,
      placeholder: 'Запиши своя отговор',
    }
  }

  const section = question.section || ''
  const text = normalizeMathText(question.question || '')

  if (section === 'writing') {
    return {
      labels: ['Отговор'],
      input: 'textarea',
      rows: 10,
      placeholder: 'Напиши пълния си текст тук...',
    }
  }

  if (section === 'sentence_transformations') {
    return {
      labels: ['Отговор'],
      input: 'text',
      placeholder: 'Попълни липсващата част на изречението',
    }
  }

  if (/(\b[Dd]WA\b|\bдве\b|\btwo\b).*(reasons|things|benefits|ways|examples|conclusions|arguments)/i.test(text)) {
    return {
      labels: ['Отговор 1', 'Отговор 2'],
      input: 'text',
      placeholder: 'Запиши кратък отговор',
    }
  }

  if (section === 'open_reading') {
    return {
      labels: ['Отговор'],
      input: 'text',
      placeholder: 'Запиши кратък свободен отговор',
    }
  }

  return {
    labels: ['Отговор'],
    input: 'textarea',
    rows: 2,
    placeholder: 'Запиши своя отговор',
  }
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
  const isNvo = exam.exam_type === 'nvo_bel' || exam.exam_type === 'nvo_math'
  const isMath = exam.exam_type === 'nvo_math' || exam.exam_type === 'dzi_math'

  return {
    id: exam.id,
    year: '',
    subject: isMath ? 'Математика' : isNvo ? 'Български език' : 'Български език и литература',
    published_at: '',
    context_text: exam.source_text || (exam.topic_focus?.length ? `Основни теми: ${exam.topic_focus.join(', ')}.` : ''),
    context_images: [],
    source_title: exam.source_title || exam.title,
    chart: exam.chart,
    exam_type: exam.exam_type,
    questions: exam.questions.map((question) => {
      const matchingGuide = question.pairs
        ? buildDziMatchingAnswerGuide(buildDziMatchingQuestionModel(question.pairs))
        : undefined
      const rawGuide = question.answer_guide
      const guideStr =
        matchingGuide
          ? matchingGuide
          : rawGuide == null
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
        pairs: question.pairs,
        correct_option: question.correct_option,
        official_answer: guideStr,
        answer_guide: guideStr,
        section: question.section,
        source_tags: question.source_tags,
      }
    }),
  }
}

function normalizeGeneratedEnglishQuestion(question: GeneratedEnglishQuestion): NvoQuestion {
  if (question.type === 'single_choice') {
    return {
      number: question.id,
      type: 'single_choice',
      question: question.prompt,
      options: question.options,
      correct_option: question.correctOption,
      official_answer: question.correctOption,
      answer_guide: question.skill,
      section: 'reading',
    }
  }

  const promptParts = [
    question.prompt,
    `Препоръчителен обем: ${question.wordLimit}`,
    'Включи в текста си:',
    ...question.bullets.map((bullet) => `- ${bullet}`),
  ]

  const reviewChecklist = [
    'Насоки за самопроверка:',
    ...question.checklist.map((item) => `- ${item}`),
  ].join('\n')

  return {
    number: question.id,
    type: 'open_response',
    question: promptParts.join('\n\n'),
    official_answer: reviewChecklist,
    answer_guide: reviewChecklist,
    section: 'writing',
  }
}

function normalizeGeneratedEnglishSection(
  section: (typeof generatedEnglishMaterialSections)[number],
): NvoExam {
  const readingContext = [section.sourceNote, ...(section.passage || [])]
    .filter(Boolean)
    .join('\n\n')

  return {
    id: `english-generated-${section.id}`,
    year: '',
    subject: 'Английски език',
    published_at: '',
    context_text: section.mode === 'reading' ? readingContext : '',
    context_images: [],
    source_title: section.title,
    exam_type: 'dzi_english',
    questions: section.questions.map(normalizeGeneratedEnglishQuestion),
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
  ...(officialEnglishMockExams as unknown as NvoExam[]),
]

const GENERATED_ENGLISH_EXAMS: NvoExam[] = generatedEnglishMaterialSections.map(normalizeGeneratedEnglishSection)

const MOCK_EXAMS: NvoExam[] = [
  ...(mockPracticeDataset as { exams: MockPracticeExam[] }).exams,
  ...(mockMathPracticeDataset as { exams: MockPracticeExam[] }).exams,
].map(normalizeMockExam)
const BERON_EXAMS: NvoExam[] = beronExamPayload.tests.map(normalizeBeronExam)

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function TestPage() {
  const params = useParams()
  const testId = String(params.id)
  const test = tests.find((t) => t.id === testId) ?? beronTests.find((t) => t.id === testId)

  if (!test) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Тест" />
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          <div className="card p-6 text-center">
            <h1 className="text-lg font-semibold text-text mb-2">Този тест не е достъпен</h1>
            <p className="text-sm text-text-muted mb-4">Избраният тест не е наличен за текущия клас или не съществува.</p>
            <Link href="/dashboard/tests" className="btn-primary justify-center">
              Към тестовете
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const datasetId = mapTestId(test.id)
  const exam = [...OFFICIAL_EXAMS, ...GENERATED_ENGLISH_EXAMS, ...MOCK_EXAMS, ...BERON_EXAMS].find((e) => e.id === datasetId) ?? null
  const storageKey = `izpiti-pro:test:${test.id}:state:v1`

  const [answers, setAnswers] = useState<SingleChoiceAnswers>({})
  const [openResponses, setOpenResponses] = useState<OpenResponses>({})
  const [submitted, setSubmitted] = useState(false)
  const [revealAnswers, setRevealAnswers] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(test.subjectName === 'Английски език')
  const [contextMediaCollapsed, setContextMediaCollapsed] = useState(false)
  const [showLottieConfetti, setShowLottieConfetti] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [premiumStatusChecked, setPremiumStatusChecked] = useState(false)

  // Premium status — drives the past-exam freemium gate (first 3 questions free).
  // While pending, we render the safe subset (first 3 only) without the locked
  // preview, so neither premium users see a paywall flash nor free users see
  // gated content leak.
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (cancelled) return
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, is_active, plan_expires_at')
          .eq('id', user.id)
          .single()
        if (cancelled) return
        setIsPremiumUser(hasActivePremium(profile))
      } finally {
        if (!cancelled) setPremiumStatusChecked(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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

  const handleSubmit = useCallback(() => {
    setSubmitted(true)
    if (typeof window === 'undefined' || !exam) return

    const isLockedNow =
      isPastExamId(testId) &&
      premiumStatusChecked &&
      !isPremiumUser &&
      exam.questions.length > FREE_PAST_EXAM_QUESTIONS
    const questionsForScore = isLockedNow
      ? exam.questions.slice(0, FREE_PAST_EXAM_QUESTIONS)
      : exam.questions

    const choiceQuestions = questionsForScore.filter((q) => q.type === 'single_choice')
    const correctCount = choiceQuestions.filter((q) => answers[q.number] === q.correct_option).length
    const percent = choiceQuestions.length ? Math.round((correctCount / choiceQuestions.length) * 100) : 0

    if (isLockedNow) {
      // Freemium past exam: only celebrate a perfect 3/3 score on the preview.
      if (choiceQuestions.length > 0 && percent === 100) {
        fireBurstConfetti()
      }
    } else {
      if (choiceQuestions.length > 0 && percent >= 80) {
        fireBurstConfetti()
      } else if (choiceQuestions.length > 0 && percent >= 70) {
        setShowLottieConfetti(false)
        requestAnimationFrame(() => setShowLottieConfetti(true))
      }
    }

    // Persist DZI attempt + activity log only on full submissions — a 3-question
    // freemium preview score would be misleading on the progress chart.
    if (!isLockedNow && choiceQuestions.length > 0) {
      try {
        const catalogEntry = allTests.find((t) => t.id === testId)
        if (catalogEntry?.examType === 'dzi12') {
          void saveDziAttempt({
            testId,
            testName: catalogEntry.title,
            score: percent,
            subject: catalogEntry.subjectName,
          })
        }
      } catch (err) {
        console.error('Failed to record DZI attempt', err)
      }

      try {
        const catalogEntry = allTests.find((t) => t.id === testId)
        logActivity({
          type: 'test',
          refId: testId,
          title: catalogEntry?.title || exam.source_title || `Тест ${testId}`,
          meta: catalogEntry?.subjectName,
          score: correctCount,
          maxScore: choiceQuestions.length,
          href: `/dashboard/tests/${testId}`,
        })
      } catch (err) {
        console.error('Failed to log test activity', err)
      }
    }

    const MISTAKES_KEY = 'nvo_mistakes'
    let existing: Array<{
      id: string; examId: string; examYear: number | string; examSubject: string
      questionNumber: number; questionText: string; options: Record<string, string>
      correctOption: string; questionImage: null; userAnswer: string
      errorType: null; topics: string[]; firstSeen: string; lastSeen: string
      attempts: Array<{ date: string; answer: string; correct: boolean }>; mastered: boolean
    }> = []
    try { existing = JSON.parse(window.localStorage.getItem(MISTAKES_KEY) || '[]') } catch { existing = [] }
    const now = new Date().toISOString()
    questionsForScore.filter((q) => q.type === 'single_choice').forEach((q) => {
      const userAnswer = answers[q.number]
      if (!userAnswer || userAnswer === q.correct_option) return
      const id = `${exam.id}_q${q.number}`
      const existingEntry = existing.find((e) => e.id === id)
      const attempt = { date: now, answer: userAnswer, correct: false }
      if (existingEntry) {
        existingEntry.userAnswer = userAnswer
        existingEntry.lastSeen = now
        existingEntry.attempts.push(attempt)
        existingEntry.mastered = false
      } else {
        const underlinedWordDisplay = buildUnderlinedWordQuestion(q)
        existing.push({
          id, examId: exam.id, examYear: exam.year, examSubject: exam.subject,
          questionNumber: q.number,
          questionText: underlinedWordDisplay
            ? `${underlinedWordDisplay.prompt} ${underlinedWordDisplay.sentenceText}`
            : q.question,
          options: underlinedWordDisplay?.choices ?? q.options ?? {},
          correctOption: q.correct_option ?? '',
          questionImage: null, userAnswer,
          errorType: null, topics: [], firstSeen: now, lastSeen: now,
          attempts: [attempt], mastered: false,
        })
      }
    })
    window.localStorage.setItem(MISTAKES_KEY, JSON.stringify(existing))
  }, [exam, answers, testId, isPremiumUser, premiumStatusChecked])

  const handleReset = useCallback(() => {
    setAnswers({})
    setOpenResponses({})
    setSubmitted(false)
    setRevealAnswers(false)
    setContextCollapsed(false)
    setContextMediaCollapsed(false)
    setShowLottieConfetti(false)
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

  const officialEnglishExam = officialEnglishMockExams.find((e) => e.id === datasetId) ?? null
  const isOfficialEnglish = officialEnglishExam !== null

  const shouldEvaluateLock =
    isPastExamId(testId) && exam.questions.length > FREE_PAST_EXAM_QUESTIONS
  const isPremiumPending = shouldEvaluateLock && !premiumStatusChecked
  const isFreemiumLocked = shouldEvaluateLock && premiumStatusChecked && !isPremiumUser
  const visibleQuestions =
    isPremiumPending || isFreemiumLocked
      ? exam.questions.slice(0, FREE_PAST_EXAM_QUESTIONS)
      : exam.questions
  const lockedQuestions = isFreemiumLocked
    ? exam.questions.slice(FREE_PAST_EXAM_QUESTIONS)
    : []
  const visibleQuestionNumbers = new Set(visibleQuestions.map((q) => q.number))
  const lockedExam: NvoExam | null = isFreemiumLocked || isPremiumPending
    ? { ...exam, questions: visibleQuestions }
    : null

  const selectableQuestions = visibleQuestions.filter((q) => q.type === 'single_choice')
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] && visibleQuestionNumbers.has(Number(k)),
  ).length
  const totalSelectable = selectableQuestions.length
  const totalQuestions = visibleQuestions.length
  const openResponseCount = Math.max(totalQuestions - totalSelectable, 0)
  const answeredOpenCount = Object.entries(openResponses).filter(([num, responseSet]) =>
    visibleQuestionNumbers.has(Number(num)) &&
    Object.values(responseSet || {}).some((value) => value.trim().length > 0),
  ).length
  const progressAnswered = totalSelectable > 0 ? answeredCount : answeredOpenCount
  const progressTotal = totalSelectable > 0 ? totalSelectable : Math.max(openResponseCount, 1)

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

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Confetti isActive={showLottieConfetti} duration={5000} loop={false} zIndex={100} />
      <TopBar title={test.title} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        {/* Score + actions bar */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-4',
              (!submitted && !revealAnswers) || totalSelectable === 0
                ? 'border-gray-200 text-text-muted'
                : score.percent >= 80
                ? 'border-green-400 text-green-700'
                : score.percent >= 60
                ? 'border-amber-400 text-amber-700'
                : 'border-red-400 text-red-700'
            )}>
              {submitted || revealAnswers ? (totalSelectable > 0 ? `${score.percent}%` : '—') : '—'}
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">Напредък</p>
              <p className="text-sm font-semibold text-text">
                {totalSelectable > 0
                  ? `${answeredCount} / ${totalSelectable} тестови отговорени`
                  : `${answeredOpenCount} / ${openResponseCount} свободни отговорени`}
              </p>
              <p className="text-xs text-text-muted">
                {openResponseCount > 0
                  ? `${totalQuestions} задачи общо · ${openResponseCount} със свободен отговор`
                  : `${totalQuestions} въпроса общо`}
              </p>
              {(submitted || revealAnswers) && totalSelectable > 0 && (
                <p className="text-xs text-text-muted">{score.correct} верни от {score.total}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSubmit}
              disabled={isPremiumPending}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {totalSelectable > 0 ? 'Провери отговорите' : 'Маркирай за преглед'}
            </button>
            <button
              onClick={() => setRevealAnswers((v) => !v)}
              disabled={isPremiumPending}
              className="btn-secondary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
              style={{ width: `${Math.round((progressAnswered / progressTotal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Context panel — hidden for official English exams (passages are inline with questions) */}
        {hasContext && !isOfficialEnglish && (
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
                {(exam.context_images || []).map((src, i) => {
                  const normalizedSrc = src.replace(/^official_assets\//, '/')
                  return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <figure key={i} className="m-0 rounded-xl overflow-x-auto border border-border bg-white">
                    <img
                      src={normalizedSrc}
                      alt={`Илюстрация ${i + 1}`}
                      className="block w-auto min-w-full max-w-none h-auto rounded-xl"
                      loading="lazy"
                    />
                  </figure>
                  )
                })}
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
        {isOfficialEnglish && officialEnglishExam ? (
          <EnglishDziTestView
            exam={
              isFreemiumLocked || isPremiumPending
                ? { ...officialEnglishExam, questions: officialEnglishExam.questions.slice(0, FREE_PAST_EXAM_QUESTIONS) }
                : officialEnglishExam
            }
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
        ) : (
          <div className="space-y-5">
            {visibleQuestions.map((q) => (
              <QuestionCard
                key={q.number}
                exam={lockedExam ?? exam}
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
        )}

        {isFreemiumLocked && lockedQuestions.length > 0 && (
          <FreemiumLockedPreview
            lockedCount={lockedQuestions.length}
            exam={exam}
            lockedQuestions={lockedQuestions}
            isOfficialEnglish={isOfficialEnglish}
            officialEnglishExam={officialEnglishExam}
          />
        )}

        {isPremiumPending && (
          <div className="card p-6 flex items-center justify-center text-sm text-text-muted">
            <span
              className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"
              aria-hidden="true"
            />
            Зареждане на още въпроси...
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <a href="/dashboard/tests" className="btn-secondary">
            Обратно към тестовете
          </a>
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
  const figureHref = FIGURE_HELPERS[exam.id]?.[question.number] ?? getMockNvoMathFigure(question.source_tags?.source_id)
  const questionImageSrc = QUESTION_IMAGES[exam.id]?.[question.number]
  const matchingModel =
    question.type === 'open_response' && question.pairs
      ? buildDziMatchingQuestionModel(question.pairs)
      : null
  const underlinedWordModel = buildUnderlinedWordQuestion(question)

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
  } else if (underlinedWordModel) {
    questionContent = (
      <>
        <p>{underlinedWordModel.prompt}</p>
        <p className="mt-2" dangerouslySetInnerHTML={{ __html: underlinedWordModel.sentenceHtml }} />
      </>
    )
  } else if (matchingModel) {
    questionContent = (
      <p>
        Свържете заглавието на всяка от творбите с нейния автор, като в листа за отговори срещу
        съответната буква запишете номера, под който е записано името на автора.
      </p>
    )
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
  const openConfig = matchingModel
    ? {
        labels: matchingModel.prompts.map((prompt) => prompt.label),
        input: 'textarea' as const,
        rows: 2,
        placeholder: 'Запиши номера на автора',
      }
    : getOpenResponseConfig(exam, question)
  const labels = openConfig.labels
  const effectiveLabels = labels

  const openEval = (() => {
    if (question.type !== 'open_response') return null
    const cleaned = cleanOfficialAnswer(question.official_answer, question.type)
    if (matchingModel) {
      return { mode: evaluateDziMatchingQuestion(matchingModel, openState), cleaned }
    }
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
      {question.task_condition && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800">
          {normalizeMathText(question.task_condition)}
        </div>
      )}
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

      {/* Inline generated figure */}
      {figureHref && (
        <div className="mb-4 rounded-lg border border-dashed border-border bg-white/60 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={figureHref}
            alt={`Чертеж към въпрос ${question.number}`}
            className="mb-3 block max-w-full rounded-lg border border-border bg-[#262523]"
            loading="lazy"
            style={{ maxHeight: '420px', width: 'auto' }}
          />
        </div>
      )}

      {/* Single choice options */}
      {question.type === 'single_choice' && (underlinedWordModel?.choices || question.options) && (
        <div className="space-y-2 pl-0">
          {Object.entries(underlinedWordModel?.choices || question.options || {}).map(([label, text]) => {
            const isSelected = chosen === label
            const isCorrect = label === question.correct_option
            const showCorrect = showFeedback && isCorrect
            const showWrong = showFeedback && isSelected && !isCorrect

            let optText: React.ReactNode = cleanMathChoiceText(text || 'Избор по изображение')
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
          {matchingModel ? (
            <>
              <div className="space-y-3">
                {matchingModel.prompts.map((prompt) => (
                  <div
                    key={prompt.label}
                    className="flex items-start gap-4 rounded-[24px] bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-500"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700">
                      {prompt.label}
                    </span>
                    <span className="pt-1 text-[15px] font-medium text-slate-500">{prompt.title}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-amber-100 bg-amber-50/70 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber-700">Автори</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {matchingModel.authors.map((author) => (
                    <div
                      key={author.number}
                      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-text shadow-sm"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {author.number}
                      </span>
                      <span className="font-medium">{author.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : question.options && Object.entries(question.options).map(([label, text]) => (
            <div key={label} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-gray-50 text-sm text-text-muted">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{label}</span>
              <span>{cleanMathChoiceText(text)}</span>
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
                  {openConfig.input === 'text' ? (
                    <input
                      type="text"
                      placeholder={openConfig.placeholder}
                      value={val}
                      onChange={(e) => onOpenResponse(question.number, label, e.target.value)}
                      className={cn(
                        'w-full border rounded-xl px-3 py-2 text-sm font-medium text-text bg-white focus:outline-none focus:ring-2',
                        isCorrect
                          ? 'border-green-400 bg-green-50 focus:ring-green-200'
                          : isIncorrect
                          ? 'border-red-300 bg-red-50 focus:ring-red-200'
                          : 'border-border focus:ring-primary/20'
                      )}
                    />
                  ) : (
                    <textarea
                      rows={openConfig.rows ?? 2}
                      placeholder={openConfig.placeholder}
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
                  )}
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

// ---------------------------------------------------------------------------
// FreemiumLockedPreview — blurred questions 4+ with premium upsell overlay
// ---------------------------------------------------------------------------
function FreemiumLockedPreview({
  lockedCount,
  exam,
  lockedQuestions,
  isOfficialEnglish,
  officialEnglishExam,
}: {
  lockedCount: number
  exam: NvoExam
  lockedQuestions: NvoQuestion[]
  isOfficialEnglish: boolean
  officialEnglishExam: { id: string; questions: { number: number }[] } | null
}) {
  const emptyAnswers: SingleChoiceAnswers = {}
  const emptyOpen: OpenResponses = {}
  const noop = () => {}

  const englishPreviewExam =
    isOfficialEnglish && officialEnglishExam
      ? {
          ...officialEnglishExam,
          questions: officialEnglishExam.questions.slice(FREE_PAST_EXAM_QUESTIONS),
        }
      : null

  return (
    <div className="relative mt-2">
      <div
        className="space-y-5 blur-md pointer-events-none select-none max-h-[420px] overflow-hidden"
        aria-hidden="true"
      >
        {englishPreviewExam ? (
          <EnglishDziTestView
            exam={englishPreviewExam as unknown as Parameters<typeof EnglishDziTestView>[0]['exam']}
            answers={emptyAnswers}
            openResponses={emptyOpen}
            submitted={false}
            revealAnswers={false}
            onAnswer={noop}
            onOpenResponse={noop}
          />
        ) : (
          lockedQuestions.map((q) => (
            <QuestionCard
              key={q.number}
              exam={exam}
              question={q}
              answers={emptyAnswers}
              openResponses={emptyOpen}
              submitted={false}
              revealAnswers={false}
              onAnswer={noop}
              onOpenResponse={noop}
            />
          ))
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 pt-32 pb-2 pointer-events-none bg-gradient-to-b from-transparent via-white/85 to-white">
        <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-text mb-1">
            Останалите {lockedCount} въпроса са премиум
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Видя първите {FREE_PAST_EXAM_QUESTIONS} безплатно. Отключи целия изпит, ключа за отговори и AI помощника.
          </p>
          <Link
            href="/dashboard/subscription"
            className="btn-primary inline-flex justify-center"
          >
            Отключи с премиум
          </Link>
        </div>
      </div>
    </div>
  )
}
