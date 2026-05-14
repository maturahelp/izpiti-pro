'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { materials, materialTypeLabels, type MaterialType } from '@/data/materials'
import { literatureThemeOrder, literatureWorks } from '@/data/literatureWorks'
import { literatureSummaries } from '@/data/literatureSummaries'
import { literatureVideoPaths } from '@/data/literatureVideoPaths'
import { literatureWorkTextPaths } from '@/data/literatureWorkTexts'
import { nvoLiteratureSummaries } from '@/data/nvoLiteratureSummaries'
import { nvoLiteratureThemeOrder, nvoLiteratureWorks } from '@/data/nvoLiteratureWorks'
import { nvoLiteratureVideoPaths } from '@/data/nvoLiteratureVideoPaths'
import { nvoLiteratureWorkTextPaths } from '@/data/nvoLiteratureWorkTexts'
import {
  nvo4BulgarianMaterials,
  nvo4MathMaterials,
  type Nvo4MaterialItem,
  type Nvo4MaterialTree,
} from '@/data/nvo4-generated-materials'
import { bulgarianRuleSections } from '@/data/bulgarianRules'
import { belTheory } from '@/data/bel-theory'
import {
  buildDziEssaySearchText,
  dziEssayMaterialGroups,
  type DziEssayMaterial,
  type DziEssaySection,
} from '@/data/dziEssayMaterials'
import math7ProblemBank from '@/data/nvo_7_math_generated_problem_bank.json'
import topicsData from '@/data/bel_curriculum_topics_content.json'
import { useGrade } from '@/lib/grade-context'
import { hasActivePremium } from '@/lib/subscription-access'
import {
  isFreeLiteratureWork,
  isFreeBelNvoTopic,
  isFreeBelDziRule,
  isFreeMathNvoSubtopic,
  isFreeEnglishDziMaterial,
  isFreeDziEssayMaterial,
} from '@/lib/free-content'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'
import { logActivity } from '@/lib/activity-log'

type Math7Topic = {
  id: string
  title: string
  subtopics: Array<{
    id: string
    title: string
    problems: Array<{ type: string }>
  }>
}

const math7Topics = (math7ProblemBank as { topics: Math7Topic[] }).topics

// Build a lookup: (sectionTitle, itemTitle) → global topic index
// Matches the flat order in bel_topics_question_bank.json
const ruleTopicIndex: Record<string, Record<string, number>> = {}
let _idx = 0
for (const section of bulgarianRuleSections) {
  ruleTopicIndex[section.title] = {}
  for (const item of section.items) {
    ruleTopicIndex[section.title][item] = _idx++
  }
}

const typeIcons: Record<MaterialType, JSX.Element> = {
  notes: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  pdf: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M9 15v-4M12 15v-6M15 15v-2"/>
    </svg>
  ),
  summary: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 10h16M4 14h10"/>
    </svg>
  ),
  scheme: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <path d="M17.5 17.5h.01M17.5 14H20M17.5 21H20M17.5 17.5H14"/>
    </svg>
  ),
}

type MaterialSection = 'bulgarian' | 'literature' | 'math' | 'english' | 'essay'

interface CurriculumTopic {
  number: number
  title: string
  short_title?: string
  subtitle?: string
  definition: string
  key_points: string[]
  exercises: unknown[]
}

interface EnglishMaterial {
  title: string
  description: string
  textHref?: string
  imageSrcs?: string[]
}

interface EnglishMaterialGroup {
  title: string
  description: string
  items: EnglishMaterial[]
}

const belCurriculumTopics = topicsData.topics as CurriculumTopic[]

const englishMaterialGroups: EnglishMaterialGroup[] = [
  {
    title: 'Essay',
    description: 'Структура, аргументиране и полезни фрази за писане на есе.',
    items: [
      {
        title: 'Essay Structure Format',
        description: 'Кратко ръководство за подредба на теза, аргументи, примери и заключение.',
        imageSrcs: [
          '/english-materials/essay-structure-guide-1.png',
          '/english-materials/essay-structure-guide-2.png',
        ],
      },
    ],
  },
  {
    title: 'Formal letter',
    description: 'Готови изрази, примерни писма и формати за официална кореспонденция.',
    items: [
      {
        title: 'Formal Letter Writing / Email / Useful phrases',
        description: 'Полезни фрази за начало, развитие и финал на formal letter или email.',
        textHref: '/english-materials/formal-letter-email-useful-phrases.txt',
      },
      {
        title: 'Letter Writing Useful Words and Expressions',
        description: 'Лексика и изрази за по-точно и естествено оформяне на писмен отговор.',
        textHref: '/english-materials/letter-writing-useful-words-and-expressions.txt',
      },
      {
        title: 'Sample Letters - Block Format',
        description: 'Примерни писма в block format за бърза ориентация преди писане.',
        imageSrcs: ['/english-materials/sample-letters-block-format.png'],
      },
    ],
  },
]

function formatMathTitleText(text: string) {
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

function splitTopicTitle(title: string) {
  const dashMatch = title.match(/\s[–-]\s/)
  if (dashMatch && dashMatch.index && dashMatch.index > 8) {
    return {
      short: title.slice(0, dashMatch.index).trim(),
      subtitle: title.slice(dashMatch.index + dashMatch[0].length).trim(),
    }
  }

  const dotIndex = title.indexOf('. ')
  if (dotIndex > 8) {
    return {
      short: title.slice(0, dotIndex).trim(),
      subtitle: title.slice(dotIndex + 2).trim(),
    }
  }

  return { short: title, subtitle: '' }
}

const sectionLabels: Record<MaterialSection, string> = {
  bulgarian: 'Български език',
  literature: 'Литература',
  math: 'Математика',
  english: 'Английски',
  essay: 'Есе/Интерпретативно съчинение',
}

const grade12Sections: MaterialSection[] = ['bulgarian', 'literature', 'essay', 'english']

type SubjectTheme = {
  accent: string
  accentHover: string
  sectionBg: string
  sectionBorder: string
  headerText: string
  cardBorder: string
  outlineBorder: string
  outlineText: string
  outlineHoverBg: string
}

const subjectTheme: Record<'bulgarian' | 'literature' | 'english' | 'math' | 'essay', SubjectTheme> = {
  bulgarian: {
    accent: '#8B5CF6',
    accentHover: '#6D3FE0',
    sectionBg: '#F3EBFF',
    sectionBorder: '#E0D0F7',
    headerText: '#5B21B6',
    cardBorder: '#E0D0F7',
    outlineBorder: '#CFBDEF',
    outlineText: '#5B21B6',
    outlineHoverBg: '#E4D4FA',
  },
  literature: {
    accent: '#1E4D7B',
    accentHover: '#174060',
    sectionBg: '#EAF4FF',
    sectionBorder: '#D0E4F7',
    headerText: '#1E4D7B',
    cardBorder: '#BCD6EF',
    outlineBorder: '#AFC4DA',
    outlineText: '#1E4D7B',
    outlineHoverBg: '#DDE9F6',
  },
  english: {
    accent: '#DC2626',
    accentHover: '#B91C1C',
    sectionBg: '#FFECEE',
    sectionBorder: '#F7CBD0',
    headerText: '#991B1B',
    cardBorder: '#F7CBD0',
    outlineBorder: '#F1B4BB',
    outlineText: '#991B1B',
    outlineHoverBg: '#FBD9DD',
  },
  math: {
    accent: '#16A34A',
    accentHover: '#15803D',
    sectionBg: '#E8F8EE',
    sectionBorder: '#C3E9CF',
    headerText: '#166534',
    cardBorder: '#C3E9CF',
    outlineBorder: '#A9DCB8',
    outlineText: '#166534',
    outlineHoverBg: '#D2EFDB',
  },
  essay: {
    accent: '#0F766E',
    accentHover: '#115E59',
    sectionBg: '#E6F6F3',
    sectionBorder: '#BFE5DD',
    headerText: '#115E59',
    cardBorder: '#BFE5DD',
    outlineBorder: '#9FD8CE',
    outlineText: '#115E59',
    outlineHoverBg: '#D4EFEA',
  },
}

// Backwards-compatible alias — existing references read via grade12SectionTheme.
const grade12SectionTheme = subjectTheme

function stripRomanNumeralPrefix(label: string): string {
  return label.replace(/^[IVXІVХ]+\.\s*/i, '')
}

function sentenceCase(label: string): string {
  if (!label) return label
  const lower = label.toLocaleLowerCase('bg-BG')
  return lower.charAt(0).toLocaleUpperCase('bg-BG') + lower.slice(1)
}

function DziEssaySectionView({ section }: { section: DziEssaySection }) {
  return (
    <section className="border-b border-border/70 pb-6 last:border-b-0 last:pb-0">
      <h4 className="mb-3 text-base font-bold text-text">{section.title}</h4>
      {section.lead && <p className="mb-3 text-sm leading-7 text-text-muted">{section.lead}</p>}
      {section.paragraphs && (
        <div className="space-y-3 text-sm leading-7 text-text">
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.title}-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      )}
      {section.bullets && (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-text">
          {section.bullets.map((item, index) => (
            <li key={`${section.title}-bullet-${index}`}>{item}</li>
          ))}
        </ul>
      )}
      {section.numbered && (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-text">
          {section.numbered.map((item, index) => (
            <li key={`${section.title}-numbered-${index}`}>{item}</li>
          ))}
        </ol>
      )}
      {section.table && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F6FBFA] text-xs font-bold uppercase text-[#115E59]">
              <tr>
                {section.table.headers.map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {section.table.rows.map((row, rowIndex) => (
                <tr key={`${section.title}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${section.title}-cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top leading-6 text-text">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.examples && (
        <div className="mt-4 space-y-3">
          {section.examples.map((example, index) => (
            <div key={`${section.title}-example-${index}`} className="rounded-xl border border-[#BFE5DD] bg-[#F6FBFA] p-4">
              <p className="mb-2 text-xs font-bold uppercase text-[#115E59]">{example.label}</p>
              {example.text && <p className="text-sm leading-7 text-text">{example.text}</p>}
              {example.before && (
                <p className="text-sm leading-7 text-text-muted">
                  <span className="font-semibold text-danger">Преди:</span> {example.before}
                </p>
              )}
              {example.after && (
                <p className="mt-1 text-sm leading-7 text-text">
                  <span className="font-semibold text-success">След:</span> {example.after}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {section.task && (
        <div className="mt-4 rounded-xl border border-amber/20 bg-amber-light p-4">
          <p className="mb-1 text-xs font-bold uppercase text-amber">{section.task.title}</p>
          <p className="text-sm leading-7 text-text">{section.task.prompt}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-text">
            {section.task.checklist.map((item, index) => (
              <li key={`${section.title}-task-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function DziEssayMaterialModal({
  material,
  onClose,
}: {
  material: DziEssayMaterial
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[86vh] rounded-2xl bg-white border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dzi-essay-title-${material.id}`}
        aria-describedby={`dzi-essay-description-${material.id}`}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#115E59]">{material.group}</p>
            <h3 id={`dzi-essay-title-${material.id}`} className="text-lg md:text-xl font-bold text-text">{material.title}</h3>
            <p id={`dzi-essay-description-${material.id}`} className="mt-1 text-sm text-text-muted">{material.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Затвори"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-[calc(86vh-112px)] overflow-y-auto bg-[#F8FBFF] p-5 md:p-6">
          <div className="space-y-6 rounded-xl border border-border bg-white p-5 md:p-6">
            {material.sections.map((section) => (
              <DziEssaySectionView key={`${material.id}-${section.title}`} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const hiddenBulgarianRulesByIndex: Record<string, number[]> = {
  'ПРАВОПИСНА НОРМА': [11, 18, 20], // 12, 19, 21 (1-based)
}

const literatureKeywords = [
  'литература',
  'художествен',
  'анализ',
  'роман',
  'поема',
  'стих',
  'цитат',
  'интерпретативно',
  'под игото',
]

function getMaterialSection(material: (typeof materials)[number]): MaterialSection {
  if (material.subjectId.startsWith('math-')) return 'math'
  if (material.subjectId.startsWith('eng-') || material.subjectName.toLowerCase().includes('англий')) return 'english'

  const searchableText = `${material.title} ${material.topicName} ${material.description}`.toLowerCase()
  const isLiterature = literatureKeywords.some((keyword) => searchableText.includes(keyword))

  if (isLiterature) return 'literature'
  return 'bulgarian'
}

const grade7Sections = ['bulgarian', 'literature', 'math'] as const
const grade4Sections = ['bulgarian', 'math'] as const
type Grade4Section = typeof grade4Sections[number]
type Grade7Section = typeof grade7Sections[number]
type WorkPanel = 'cover' | 'text' | 'summary' | 'video' | 'exercise'
const LITERATURE_READING_PROGRESS_STORAGE_KEY = 'literature-reading-progress-v1'
const NVO_READING_PROGRESS_STORAGE_KEY = 'nvo-literature-reading-progress-v1'

const grade4SectionLabels: Record<Grade4Section, string> = {
  bulgarian: 'Български език',
  math: 'Математика',
}

const nvo4MaterialItemLabels: Record<Nvo4MaterialItem['type'], string> = {
  theory: 'Теория',
  worked_example: 'Пример',
  practice: 'Упражнение',
  quick_check: 'Проверка',
  exam_tip: 'Съвет',
}

function formatNvo4MaterialText(text: string) {
  return text
    .replace(/\\\(\\square\\\)/g, '□')
    .replace(/\\\(\\cdot\\\)/g, '·')
}

function fireGrade4MaterialConfetti() {
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

const grade7SectionLabels: Record<Grade7Section, string> = {
  bulgarian: 'Български език',
  literature: 'Литература',
  math: 'Математика',
}

export default function MaterialsPage() {
  const { grade, lockedGrade } = useGrade()
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState<MaterialSection>('bulgarian')
  const [grade4Section, setGrade4Section] = useState<Grade4Section>('bulgarian')
  const [grade4CompletedLessonIds, setGrade4CompletedLessonIds] = useState<Record<string, boolean>>({})
  const [grade7Section, setGrade7Section] = useState<Grade7Section>('bulgarian')
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)
  const [activeNvoWorkId, setActiveNvoWorkId] = useState<string | null>(null)
  const [activeWorkText, setActiveWorkText] = useState<string>('')
  const [activeWorkTextLoading, setActiveWorkTextLoading] = useState(false)
  const [activeWorkTextError, setActiveWorkTextError] = useState<string | null>(null)
  const [activeNvoWorkText, setActiveNvoWorkText] = useState<string>('')
  const [activeNvoWorkTextLoading, setActiveNvoWorkTextLoading] = useState(false)
  const [activeNvoWorkTextError, setActiveNvoWorkTextError] = useState<string | null>(null)
  const [isActiveWorkVideoPlaying, setIsActiveWorkVideoPlaying] = useState(false)
  const [isActiveNvoVideoPlaying, setIsActiveNvoVideoPlaying] = useState(false)
  const [isWorkReadingMarkerEnabled, setIsWorkReadingMarkerEnabled] = useState(false)
  const [isNvoReadingMarkerEnabled, setIsNvoReadingMarkerEnabled] = useState(false)
  const [workReadingProgressByWork, setWorkReadingProgressByWork] = useState<Record<string, number>>({})
  const [nvoReadingProgressByWork, setNvoReadingProgressByWork] = useState<Record<string, number>>({})
  const [activeWorkPanel, setActiveWorkPanel] = useState<WorkPanel>('cover')
  const [activeNvoWorkPanel, setActiveNvoWorkPanel] = useState<WorkPanel>('cover')
  const [searchQuery, setSearchQuery] = useState('')
  const [theoryIndex, setTheoryIndex] = useState<number | null>(null)
  const [activeEnglishMaterial, setActiveEnglishMaterial] = useState<EnglishMaterial | null>(null)
  const [activeDziEssayMaterial, setActiveDziEssayMaterial] = useState<DziEssayMaterial | null>(null)
  const [englishMaterialText, setEnglishMaterialText] = useState('')
  const [englishMaterialLoading, setEnglishMaterialLoading] = useState(false)
  const [englishMaterialError, setEnglishMaterialError] = useState<string | null>(null)
  const [fullscreenImageSrc, setFullscreenImageSrc] = useState<string | null>(null)
  const [fullscreenImageZoom, setFullscreenImageZoom] = useState(1)
  const [fullscreenImageGallery, setFullscreenImageGallery] = useState<string[] | null>(null)
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0)
  const [fullscreenImageTitle, setFullscreenImageTitle] = useState<string>('')
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const workWordRefs = useRef<Record<number, HTMLSpanElement | null>>({})
  const nvoWordRefs = useRef<Record<number, HTMLSpanElement | null>>({})

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const effectiveGrade = lockedGrade ?? grade

  const filtered = materials.filter((m) => {
    if (getMaterialSection(m) !== selectedSection) return false
    if (!normalizedQuery) return true

    const searchableText = `${m.title} ${m.topicName} ${m.description} ${m.subjectName}`.toLowerCase()
    if (!searchableText.includes(normalizedQuery)) return false

    return true
  })

  const typeColors: Record<MaterialType, string> = {
    notes: 'text-primary bg-primary-light',
    pdf: 'text-danger bg-danger-light',
    summary: 'text-success bg-success-light',
    scheme: 'text-amber bg-amber-light',
  }

  const literatureGroups = literatureThemeOrder
    .map((theme) => ({
      theme,
      works: literatureWorks.filter((work) => {
        if (work.theme !== theme) return false
        if (!normalizedQuery) return true
        const searchableText = `${work.title} ${work.author} ${work.theme}`.toLowerCase()
        return searchableText.includes(normalizedQuery)
      }),
    }))
    .filter((group) => group.works.length > 0)

  const filteredLiteratureCount = literatureGroups.reduce((acc, group) => acc + group.works.length, 0)

  const bulgarianRuleGroups = bulgarianRuleSections
    .map((section) => {
      const sectionMatch = section.title.toLowerCase().includes(normalizedQuery)
      const hiddenIndexes = new Set(hiddenBulgarianRulesByIndex[section.title] ?? [])
      const items = section.items.filter((item, itemIndex) => {
        if (hiddenIndexes.has(itemIndex)) return false
        if (!normalizedQuery) return true
        if (sectionMatch) return true
        return item.toLowerCase().includes(normalizedQuery)
      })
      return { ...section, items }
    })
    .filter((section) => section.items.length > 0)

  const bulgarianRulesCount = bulgarianRuleGroups.reduce((acc, section) => acc + section.items.length, 0)

  const activeWork = literatureWorks.find((work) => work.id === activeWorkId)
  const activeWorkSummary = activeWork ? literatureSummaries[activeWork.id] ?? [] : []
  const activeWorkVideoPath = activeWorkId ? literatureVideoPaths[activeWorkId] : undefined
  const activeWorkMarkedWordIndex = activeWorkId ? workReadingProgressByWork[activeWorkId] : undefined
  const activeWorkTextTokens = useMemo(() => activeWorkText.split(/(\s+)/), [activeWorkText])
  const activeNvoWork = nvoLiteratureWorks.find((w) => w.id === activeNvoWorkId)
  const activeNvoWorkSummary = activeNvoWork ? nvoLiteratureSummaries[activeNvoWork.id] ?? [] : []
  const activeNvoVideoPath = activeNvoWorkId ? nvoLiteratureVideoPaths[activeNvoWorkId] : undefined
  const activeNvoMarkedWordIndex = activeNvoWorkId ? nvoReadingProgressByWork[activeNvoWorkId] : undefined
  const activeNvoTextTokens = useMemo(() => activeNvoWorkText.split(/(\s+)/), [activeNvoWorkText])
  const hasPremiumAccess = isPremiumUser

  const nvoLiteratureGroups = nvoLiteratureThemeOrder
    .map((theme) => ({
      theme,
      works: nvoLiteratureWorks.filter((w) => w.theme === theme),
    }))
    .filter((group) => group.works.length > 0)

  const filteredBelCurriculumTopics = belCurriculumTopics
    .map((topic, topicIndex) => ({ topic, topicIndex }))
    .filter(({ topic }) => {
      if (!normalizedQuery) return true
      const searchableText = [
        topic.title,
        topic.short_title,
        topic.subtitle,
        topic.definition,
        ...(topic.key_points ?? []),
      ].filter(Boolean).join(' ').toLowerCase()
      return searchableText.includes(normalizedQuery)
    })

  const filteredEnglishMaterialGroups = englishMaterialGroups
    .map((group) => {
      const groupMatches = `${group.title} ${group.description}`.toLowerCase().includes(normalizedQuery)
      const items = group.items.filter((item) => {
        if (!normalizedQuery) return true
        if (groupMatches) return true
        return `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery)
      })
      return { ...group, items }
    })
    .filter((group) => group.items.length > 0)

  const englishMaterialsCount = filteredEnglishMaterialGroups.reduce((acc, group) => acc + group.items.length, 0)

  const filteredDziEssayMaterialGroups = dziEssayMaterialGroups
    .map((group) => {
      const groupMatches = `${group.title} ${group.description}`.toLowerCase().includes(normalizedQuery)
      const items = group.items.filter((item) => {
        if (!normalizedQuery) return true
        if (groupMatches) return true
        return buildDziEssaySearchText(item).includes(normalizedQuery)
      })
      return { ...group, items }
    })
    .filter((group) => group.items.length > 0)

  const dziEssayMaterialsCount = filteredDziEssayMaterialGroups.reduce((acc, group) => acc + group.items.length, 0)

  const redirectToSubscription = () => {
    router.push('/dashboard/subscription')
  }

  const handlePremiumAction = (action: () => void, isFreeOverride = false) => {
    if (!hasPremiumAccess && !isFreeOverride) {
      redirectToSubscription()
      return
    }

    action()
  }

  const isActiveWorkFree = isFreeLiteratureWork(activeWorkId)
  const isActiveNvoWorkFree = isFreeLiteratureWork(activeNvoWorkId)

  const handleWorkPanelChange = (panel: WorkPanel) => {
    if (panel !== 'text' && !hasPremiumAccess && !isActiveWorkFree) {
      redirectToSubscription()
      return
    }

    setActiveWorkPanel(panel)
    setIsActiveWorkVideoPlaying(false)
  }

  const handleNvoWorkPanelChange = (panel: WorkPanel) => {
    if (panel !== 'text' && !hasPremiumAccess && !isActiveNvoWorkFree) {
      redirectToSubscription()
      return
    }

    setActiveNvoWorkPanel(panel)
    setIsActiveNvoVideoPlaying(false)
  }

  const handleWorkWordMark = (wordIndex: number) => {
    if (!activeWorkId || !isWorkReadingMarkerEnabled) return

    setWorkReadingProgressByWork((prev) => {
      const current = prev[activeWorkId]
      if (current === wordIndex) {
        const next = { ...prev }
        delete next[activeWorkId]
        return next
      }
      return { ...prev, [activeWorkId]: wordIndex }
    })
  }

  const handleNvoWordMark = (wordIndex: number) => {
    if (!activeNvoWorkId || !isNvoReadingMarkerEnabled) return

    setNvoReadingProgressByWork((prev) => {
      const current = prev[activeNvoWorkId]
      if (current === wordIndex) {
        const next = { ...prev }
        delete next[activeNvoWorkId]
        return next
      }
      return { ...prev, [activeNvoWorkId]: wordIndex }
    })
  }

  const openImageGallery = (images: string[], title: string, startIndex = 0) => {
    setFullscreenImageGallery(images)
    setFullscreenImageIndex(startIndex)
    setFullscreenImageTitle(title)
    setFullscreenImageSrc(images[startIndex] ?? null)
    setFullscreenImageZoom(1)
  }

  const closeImageGallery = () => {
    setFullscreenImageGallery(null)
    setFullscreenImageSrc(null)
    setFullscreenImageZoom(1)
    setFullscreenImageTitle('')
  }

  const goToGalleryIndex = (nextIndex: number) => {
    if (!fullscreenImageGallery) return
    const clamped = (nextIndex + fullscreenImageGallery.length) % fullscreenImageGallery.length
    setFullscreenImageIndex(clamped)
    setFullscreenImageSrc(fullscreenImageGallery[clamped])
    setFullscreenImageZoom(1)
  }

  const openEnglishMaterial = async (material: EnglishMaterial) => {
    if (!hasPremiumAccess && !isFreeEnglishDziMaterial(material.title)) {
      redirectToSubscription()
      return
    }

    setActiveEnglishMaterial(material)
    setEnglishMaterialText('')
    setEnglishMaterialError(null)

    if (!material.textHref) {
      setEnglishMaterialLoading(false)
      return
    }

    setEnglishMaterialLoading(true)

    try {
      const response = await fetch(material.textHref)
      if (!response.ok) throw new Error('Неуспешно зареждане')
      const text = await response.text()
      setEnglishMaterialText(text.trim())
    } catch {
      setEnglishMaterialError('Материалът не може да бъде зареден в момента.')
    } finally {
      setEnglishMaterialLoading(false)
    }
  }

  const openDziEssayMaterial = (material: DziEssayMaterial) => {
    if (!hasPremiumAccess && !isFreeDziEssayMaterial(material.id)) {
      redirectToSubscription()
      return
    }

    setActiveDziEssayMaterial(material)
  }

  const openDziEssayTest = (material: DziEssayMaterial) => {
    if (!hasPremiumAccess && !isFreeDziEssayMaterial(material.id)) {
      redirectToSubscription()
      return
    }

    router.push(`/dashboard/materials/dzi-essay-test/${material.id}`)
  }

  const completeGrade4Lesson = (lessonId: string) => {
    setGrade4CompletedLessonIds((prev) => ({ ...prev, [lessonId]: true }))
    fireGrade4MaterialConfetti()
  }

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_active, plan_expires_at')
        .eq('id', user.id)
        .single()

      if (cancelled) return

      setIsPremiumUser(hasActivePremium(profile))
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeWorkId) {
      setActiveWorkText('')
      setActiveWorkTextError(null)
      setActiveWorkTextLoading(false)
      return
    }

    const textPath = literatureWorkTextPaths[activeWorkId]
    if (!textPath) {
      setActiveWorkText('')
      setActiveWorkTextError('Текстът на произведението не е наличен.')
      setActiveWorkTextLoading(false)
      return
    }

    let isCancelled = false
    setActiveWorkTextLoading(true)
    setActiveWorkTextError(null)
    setActiveWorkText('')
    workWordRefs.current = {}

    fetch(encodeURI(textPath))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Неуспешно зареждане на текста.')
        }
        return response.text()
      })
      .then((text) => {
        if (isCancelled) return
        const normalizedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
        setActiveWorkText(normalizedText)
      })
      .catch(() => {
        if (isCancelled) return
        setActiveWorkTextError('Не успяхме да заредим текста. Опитай отново.')
      })
      .finally(() => {
        if (isCancelled) return
        setActiveWorkTextLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [activeWorkId])

  useEffect(() => {
    if (!activeNvoWorkId) {
      setActiveNvoWorkText('')
      setActiveNvoWorkTextError(null)
      setActiveNvoWorkTextLoading(false)
      return
    }

    const textPath = nvoLiteratureWorkTextPaths[activeNvoWorkId]
    if (!textPath) {
      setActiveNvoWorkText('')
      setActiveNvoWorkTextError('Текстът за това произведение все още не е добавен.')
      setActiveNvoWorkTextLoading(false)
      return
    }

    let isCancelled = false
    setActiveNvoWorkTextLoading(true)
    setActiveNvoWorkTextError(null)
    setActiveNvoWorkText('')
    nvoWordRefs.current = {}

    fetch(encodeURI(textPath))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Неуспешно зареждане на текста.')
        }
        return response.text()
      })
      .then((text) => {
        if (isCancelled) return
        const normalizedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
        setActiveNvoWorkText(normalizedText)
      })
      .catch(() => {
        if (isCancelled) return
        setActiveNvoWorkTextError('Не успяхме да заредим текста. Опитай отново.')
      })
      .finally(() => {
        if (isCancelled) return
        setActiveNvoWorkTextLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [activeNvoWorkId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(LITERATURE_READING_PROGRESS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, number>
      if (parsed && typeof parsed === 'object') {
        setWorkReadingProgressByWork(parsed)
      }
    } catch {
      // Ignore malformed localStorage payloads and continue safely.
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LITERATURE_READING_PROGRESS_STORAGE_KEY, JSON.stringify(workReadingProgressByWork))
  }, [workReadingProgressByWork])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(NVO_READING_PROGRESS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, number>
      if (parsed && typeof parsed === 'object') {
        setNvoReadingProgressByWork(parsed)
      }
    } catch {
      // Ignore malformed localStorage payloads and continue safely.
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(NVO_READING_PROGRESS_STORAGE_KEY, JSON.stringify(nvoReadingProgressByWork))
  }, [nvoReadingProgressByWork])

  useEffect(() => {
    if (activeWorkPanel !== 'text') return
    if (typeof activeWorkMarkedWordIndex !== 'number') return
    const target = workWordRefs.current[activeWorkMarkedWordIndex]
    if (!target) return

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [activeWorkPanel, activeWorkMarkedWordIndex, activeWorkText])

  useEffect(() => {
    if (activeNvoWorkPanel !== 'text') return
    if (typeof activeNvoMarkedWordIndex !== 'number') return
    const target = nvoWordRefs.current[activeNvoMarkedWordIndex]
    if (!target) return

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [activeNvoWorkPanel, activeNvoMarkedWordIndex, activeNvoWorkText])

  useEffect(() => {
    if (activeWorkId) {
      setActiveWorkPanel('cover')
      setIsActiveWorkVideoPlaying(false)
      setIsWorkReadingMarkerEnabled(false)
    }
  }, [activeWorkId])

  useEffect(() => {
    if (activeNvoWorkId) {
      setActiveNvoWorkPanel('cover')
      setIsActiveNvoVideoPlaying(false)
      setIsNvoReadingMarkerEnabled(false)
    }
  }, [activeNvoWorkId])

  useEffect(() => {
    if (hasPremiumAccess || isActiveWorkFree) return
    if (activeWorkPanel === 'text' || activeWorkPanel === 'cover') return
    setActiveWorkPanel('text')
    setIsActiveWorkVideoPlaying(false)
  }, [activeWorkPanel, hasPremiumAccess, isActiveWorkFree])

  useEffect(() => {
    if (hasPremiumAccess || isActiveNvoWorkFree) return
    if (activeNvoWorkPanel === 'text' || activeNvoWorkPanel === 'cover') return
    setActiveNvoWorkPanel('text')
    setIsActiveNvoVideoPlaying(false)
  }, [activeNvoWorkPanel, hasPremiumAccess, isActiveNvoWorkFree])

  useEffect(() => {
    const allowedSections = effectiveGrade === '4'
      ? (grade4Sections as readonly MaterialSection[])
      : effectiveGrade === '7'
      ? (grade7Sections as readonly MaterialSection[])
      : grade12Sections

    if (!allowedSections.includes(selectedSection)) {
      setSelectedSection('bulgarian')
    }
  }, [effectiveGrade, selectedSection])

  if (effectiveGrade === '4') {
    const theme = subjectTheme[grade4Section]
    const materialTree: Nvo4MaterialTree = grade4Section === 'bulgarian' ? nvo4BulgarianMaterials : nvo4MathMaterials
    const quickLinks = grade4Section === 'bulgarian'
      ? [
          {
            title: 'Официални НВО тестове по БЕЛ',
            description: 'Тестове и ключове от МОН за 4. клас по години.',
            href: '/dashboard/tests?grade=4&section=bel&mode=past',
            action: 'Отвори тестовете',
          },
          {
            title: 'Модели и примерни материали',
            description: 'Модели на НВО и примерни тестове от официалната страница.',
            href: '/dashboard/tests?grade=4&section=bel&mode=sample',
            action: 'Виж моделите',
          },
          {
            title: '10 пробни НВО по БЕЛ',
            description: 'Оригинални пробни тестове по формата на официалното НВО.',
            href: '/dashboard/tests?grade=4&section=bel&mode=sample',
            action: 'Започни пробен тест',
          },
        ]
      : [
          {
            title: 'Официални НВО тестове по математика',
            description: 'Тестове и ключове от МОН за 4. клас по години.',
            href: '/dashboard/tests?grade=4&section=math&mode=past',
            action: 'Отвори тестовете',
          },
          {
            title: 'Модели и примерни материали',
            description: 'Модели на НВО и примерни тестове от официалната страница.',
            href: '/dashboard/tests?grade=4&section=math&mode=sample',
            action: 'Виж моделите',
          },
          {
            title: '10 пробни НВО по математика',
            description: 'Оригинални пробни тестове с генерирани фигури, схеми и графики.',
            href: '/dashboard/tests?grade=4&section=math&mode=sample',
            action: 'Започни пробен тест',
          },
        ]

    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Материали" />
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {grade4Sections.map((section) => {
              const sectionTheme = subjectTheme[section]
              const isActive = grade4Section === section
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setGrade4Section(section)}
                  style={
                    isActive
                      ? { backgroundColor: sectionTheme.accent, borderColor: sectionTheme.accent, color: '#ffffff' }
                      : undefined
                  }
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                    isActive ? '' : 'bg-white text-text border-border hover:bg-slate-50'
                  )}
                >
                  {grade4SectionLabels[section]}
                </button>
              )
            })}
          </div>

          <div
            className="rounded-2xl border p-4 md:p-5"
            style={{ backgroundColor: theme.sectionBg, borderColor: theme.sectionBorder }}
          >
            <p className="text-sm text-text-muted mb-4">
              Материали за <strong className="text-text">{grade4SectionLabels[grade4Section]}</strong> (4. клас)
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {quickLinks.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border bg-white p-5 flex min-h-[190px] flex-col"
                  style={{ borderColor: theme.cardBorder }}
                >
                  <h3 className="text-sm font-bold text-text leading-snug">{card.title}</h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{card.description}</p>
                  <button
                    type="button"
                    onClick={() => card.href && router.push(card.href)}
                    disabled={!card.href}
                    style={card.href ? { color: theme.outlineText, borderColor: theme.outlineBorder } : undefined}
                    className="mt-auto inline-flex justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-text-muted"
                  >
                    {card.action}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-white/70 p-4">
              <div className="mb-4">
                <h2 className="text-base font-bold text-text">{materialTree.title}</h2>
                <p className="mt-1 text-sm text-text-muted leading-relaxed">{materialTree.description}</p>
              </div>

              <div className="space-y-4">
                {materialTree.units.map((unit) => (
                  <section key={unit.id} className="border-t border-white/80 pt-4 first:border-t-0 first:pt-0">
                    <div className="mb-3">
                      <h3 className="text-sm font-bold" style={{ color: theme.headerText }}>{unit.title}</h3>
                      <p className="mt-1 text-sm text-text-muted leading-relaxed">{unit.description}</p>
                    </div>
                    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                      {unit.lessons.map((lesson) => (
                        <details key={lesson.id} className="group">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left">
                            <span>
                              <span className="block text-sm font-semibold text-text">{lesson.title}</span>
                              <span className="mt-1 block text-xs leading-relaxed text-text-muted">{formatNvo4MaterialText(lesson.goal)}</span>
                            </span>
                            <span className="mt-1 text-xs font-bold text-text-muted transition-transform group-open:rotate-180">⌄</span>
                          </summary>
                          <div className="px-4 pb-4">
                            <div className="space-y-3">
                              {lesson.items.map((item) => (
                                <div key={item.id} className="border-l-2 pl-3" style={{ borderColor: theme.outlineBorder }}>
                                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.headerText }}>
                                    {nvo4MaterialItemLabels[item.type]} · {item.title}
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-text">{formatNvo4MaterialText(item.body)}</p>
                                  {item.prompts?.length ? (
                                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-text-muted">
                                      {item.prompts.map((prompt) => (
                                        <li key={prompt}>• {formatNvo4MaterialText(prompt)}</li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() => completeGrade4Lesson(lesson.id)}
                                disabled={Boolean(grade4CompletedLessonIds[lesson.id])}
                                style={
                                  grade4CompletedLessonIds[lesson.id]
                                    ? { backgroundColor: theme.sectionBg, borderColor: theme.sectionBorder, color: theme.headerText }
                                    : { backgroundColor: theme.accent, borderColor: theme.accent, color: '#ffffff' }
                                }
                                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                              >
                                {grade4CompletedLessonIds[lesson.id] ? 'Урокът е завършен' : 'Маркирай урока като готов'}
                              </button>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (effectiveGrade === '7') {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Материали" />
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="hidden md:block" />

            <div className="flex flex-wrap justify-center gap-2">
              {grade7Sections.map((section) => {
                const theme = subjectTheme[section]
                const isActive = grade7Section === section
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setGrade7Section(section)}
                    style={
                      isActive
                        ? { backgroundColor: theme.accent, borderColor: theme.accent, color: '#ffffff' }
                        : undefined
                    }
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                      isActive ? '' : 'bg-white text-text border-border hover:bg-slate-50'
                    )}
                  >
                    {grade7SectionLabels[section]}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-center md:justify-end">
              <label className="relative w-full max-w-[180px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Търси"
                  className="w-full rounded-xl border border-border bg-white py-1.5 pl-8 pr-2 text-xs text-text placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>
          </div>

          {grade7Section === 'bulgarian' ? (
            <div
              className="rounded-2xl border p-4 md:p-5"
              style={{
                backgroundColor: subjectTheme.bulgarian.sectionBg,
                borderColor: subjectTheme.bulgarian.sectionBorder,
              }}
            >
              <p className="text-sm text-text-muted mb-4">
                Намерени: <strong className="text-text">{filteredBelCurriculumTopics.length}</strong> учебни теми
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {filteredBelCurriculumTopics.map(({ topic, topicIndex }) => {
                  const heading = topic.short_title ?? splitTopicTitle(topic.title).short
                  const subtitle = topic.subtitle ?? splitTopicTitle(topic.title).subtitle
                  const isFreeItem = isFreeBelNvoTopic(topicIndex)

                  return (
                    <div
                      key={topic.number}
                      className={cn('relative h-full min-h-[220px] rounded-xl border bg-white p-5 text-left transition-transform duration-200 hover:-translate-y-0.5 flex flex-col', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                      style={{ borderColor: subjectTheme.bulgarian.cardBorder }}
                    >
                      {!hasPremiumAccess && !isFreeItem && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="amber">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Премиум
                          </Badge>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-sans font-semibold text-text text-[15px] leading-snug tracking-normal mb-2 break-words line-clamp-2"
                          title={heading}
                        >
                          {heading}
                        </h3>
                        <p
                          className="font-sans text-[15px] font-semibold text-text leading-snug tracking-normal mb-4 break-words line-clamp-2 min-h-[2.6em]"
                          title={subtitle || undefined}
                        >
                          {subtitle || '\u00A0'}
                        </p>
                        <p
                          className="font-sans text-sm font-semibold tracking-normal mb-4"
                          style={{ color: subjectTheme.bulgarian.accent, opacity: 0.8 }}
                        >
                          Тема #{topic.number}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={() =>
                            handlePremiumAction(
                              () =>
                                router.push(`/dashboard/materials/curriculum-topic/${topicIndex}?view=theory`),
                              isFreeBelNvoTopic(topicIndex)
                            )
                          }
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = subjectTheme.bulgarian.outlineHoverBg }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
                          className="flex-1 rounded-lg border bg-white text-sm font-bold py-3 transition-colors"
                          style={{
                            borderColor: subjectTheme.bulgarian.outlineBorder,
                            color: subjectTheme.bulgarian.outlineText,
                          }}
                        >
                          Теория
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handlePremiumAction(
                              () =>
                                router.push(`/dashboard/materials/curriculum-topic/${topicIndex}?view=exercise`),
                              isFreeBelNvoTopic(topicIndex)
                            )
                          }
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = subjectTheme.bulgarian.outlineHoverBg }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
                          className="flex-1 rounded-lg border bg-white text-sm font-bold py-3 transition-colors"
                          style={{
                            borderColor: subjectTheme.bulgarian.outlineBorder,
                            color: subjectTheme.bulgarian.outlineText,
                          }}
                        >
                          Тест
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {filteredBelCurriculumTopics.length === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени теми</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          ) : grade7Section === 'literature' ? (
            <div
              className="rounded-2xl border p-4 md:p-5"
              style={{
                backgroundColor: subjectTheme.literature.sectionBg,
                borderColor: subjectTheme.literature.sectionBorder,
              }}
            >
              <p className="text-sm text-text-muted mb-4">
                Намерени: <strong className="text-text">{nvoLiteratureWorks.length}</strong> творби
              </p>
              <div className="space-y-6">
                {nvoLiteratureGroups.map(({ theme, works }, themeIndex) => (
                  <section key={theme}>
                    <h3
                      className="text-sm md:text-base font-semibold text-center mb-3"
                      style={{ color: subjectTheme.literature.headerText }}
                    >
                      {themeIndex + 1}. {stripRomanNumeralPrefix(theme)}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {works.map((work) => {
                        const isFreeItem = isFreeLiteratureWork(work.id)
                        return (
                        <button
                          key={work.id}
                          type="button"
                          onClick={() => setActiveNvoWorkId(work.id)}
                          className={cn('relative rounded-xl border border-border bg-white p-4 text-left transition-transform duration-200 hover:-translate-y-0.5', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                        >
                          {!hasPremiumAccess && !isFreeItem && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="amber">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Премиум
                              </Badge>
                            </div>
                          )}
                          <p className="text-xs font-semibold text-text-muted mb-1">{work.author}</p>
                          <h3 className="font-semibold text-text text-sm leading-snug mb-3">{work.title}</h3>
                          <img
                            src={encodeURI(work.image)}
                            alt={work.title}
                            className="w-full h-auto object-contain rounded-lg border border-border"
                          />
                          <p className="mt-3 text-xs font-semibold text-primary">Отвори произведението</p>
                        </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : grade7Section === 'math' ? (
            <div
              className="rounded-2xl border p-4 md:p-5"
              style={{
                backgroundColor: subjectTheme.math.sectionBg,
                borderColor: subjectTheme.math.sectionBorder,
              }}
            >
              <p className="text-sm text-text-muted mb-4">
                Намерени: <strong className="text-text">{math7Topics.reduce((sum, topic) => sum + topic.subtopics.length, 0)}</strong> подтеми
              </p>
              <div className="space-y-6">
                {math7Topics.map((topic, topicIndex) => (
                  <section key={topic.id}>
                    <h3
                      className="text-sm md:text-base font-semibold text-center mb-3"
                      style={{ color: subjectTheme.math.headerText }}
                    >
                      {topicIndex + 1}. {formatMathTitleText(topic.title)}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topic.subtopics.map((subtopic, subtopicIndex) => {
                        const isFreeItem = isFreeMathNvoSubtopic(topic.id, subtopic.id)
                        return (
                        <button
                          key={subtopic.id}
                          type="button"
                          onClick={() =>
                            handlePremiumAction(
                              () => router.push(`/dashboard/materials/math-7-topics?subtopic=${subtopic.id}`),
                              isFreeItem
                            )
                          }
                          className={cn('relative rounded-xl border border-border bg-white p-4 text-left transition-transform duration-200 hover:-translate-y-0.5', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                          style={{ borderColor: subjectTheme.math.cardBorder }}
                        >
                          {!hasPremiumAccess && !isFreeItem && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="amber">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Премиум
                              </Badge>
                            </div>
                          )}
                          <p className="text-xs font-semibold text-text-muted mb-1">
                            Подтема #{subtopicIndex + 1}
                          </p>
                          <h3 className="font-semibold text-text text-sm leading-snug mb-3">
                            {formatMathTitleText(subtopic.title)}
                          </h3>
                          <p
                            className="mt-3 text-xs font-semibold"
                            style={{ color: subjectTheme.math.headerText }}
                          >
                            {subtopic.problems.length} задачи →
                          </p>
                        </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-30">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              <p className="font-semibold text-base mb-1">
                Материалите за {grade7SectionLabels[grade7Section]} (7. клас)
              </p>
              <p className="text-sm">скоро ще бъдат добавени</p>
            </div>
          )}
        </div>

        {activeNvoWork && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-start lg:items-center justify-center overflow-y-auto"
            onClick={() => setActiveNvoWorkId(null)}
          >
            <div
              className="w-full max-w-5xl rounded-2xl bg-white border border-border shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Литература — 7. клас</p>
                  <h3 className="text-lg md:text-xl font-bold text-text">{activeNvoWork.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{activeNvoWork.author}</p>
                  <p className="text-xs text-text-muted mt-1">{activeNvoWork.theme}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNvoWorkId(null)}
                  className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-gray-50 transition-colors flex items-center justify-center"
                  aria-label="Затвори"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1.2fr_0.8fr] rounded-xl border border-border overflow-hidden">
                  <div className="p-4 md:p-6 bg-[#F8FBFF] border-t lg:border-t-0 lg:border-r border-border">
                    {activeNvoWorkPanel === 'text' ? (
                      <div className="flex h-[60vh] max-h-[60vh] lg:h-[70vh] lg:max-h-[70vh] flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsNvoReadingMarkerEnabled((prev) => !prev)}
                            className={cn(
                              'w-7 h-7 rounded-full border flex items-center justify-center transition-colors',
                              isNvoReadingMarkerEnabled
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-text-muted border-border hover:text-text hover:bg-gray-50'
                            )}
                            aria-label={isNvoReadingMarkerEnabled ? 'Изключи маркиране' : 'Включи маркиране'}
                            title={isNvoReadingMarkerEnabled ? 'Изключи маркиране' : 'Включи маркиране'}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </button>
                          <p className="text-xs font-medium text-text-muted">Маркирай до къде си стигнал</p>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-white p-4">
                          {activeNvoWorkTextLoading ? (
                            <p className="text-sm text-text-muted">Зареждане...</p>
                          ) : activeNvoWorkTextError ? (
                            <p className="text-sm text-danger">{activeNvoWorkTextError}</p>
                          ) : (
                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-text">
                              {(() => {
                                let wordIndex = -1
                                return activeNvoTextTokens.map((token, idx) => {
                                  if (/^\s+$/.test(token)) {
                                    return <span key={`space-${idx}`}>{token}</span>
                                  }

                                  wordIndex += 1
                                  const currentWordIndex = wordIndex
                                  const isMarked = activeNvoMarkedWordIndex === currentWordIndex

                                  return (
                                    <span
                                      key={`word-${idx}-${currentWordIndex}`}
                                      ref={(el) => {
                                        nvoWordRefs.current[currentWordIndex] = el
                                      }}
                                      onClick={() => handleNvoWordMark(currentWordIndex)}
                                      className={cn(
                                        'rounded-sm',
                                        isMarked && 'bg-amber-200 px-0.5',
                                        isNvoReadingMarkerEnabled && 'cursor-pointer hover:bg-amber-100'
                                      )}
                                    >
                                      {token}
                                    </span>
                                  )
                                })
                              })()}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : activeNvoWorkPanel === 'summary' ? (
                      <div className="w-full max-h-[60vh] lg:max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-white p-4">
                        <h4 className="mb-3 text-sm font-semibold text-[#1E4D7B]">„{activeNvoWork.title}“</h4>
                        {activeNvoWorkSummary.length > 0 ? (
                          <div className="space-y-2 text-sm leading-7 text-text">
                            {activeNvoWorkSummary.map((sentence, index) => (
                              <p key={`${activeNvoWork.id}-summary-${index}`}>{sentence}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-muted">Резюмето за това произведение все още не е добавено.</p>
                        )}
                      </div>
                    ) : activeNvoWorkPanel === 'video' && activeNvoVideoPath && isActiveNvoVideoPlaying ? (
                      <video
                        key={activeNvoVideoPath}
                        controls
                        autoPlay
                        playsInline
                        preload="auto"
                        poster={encodeURI(activeNvoWork.image)}
                        className="w-full max-h-[70vh] rounded-xl border border-border bg-black"
                      >
                        <source src={encodeURI(activeNvoVideoPath)} type="video/mp4" />
                        Браузърът не поддържа видео.
                      </video>
                    ) : activeNvoWorkPanel === 'video' && activeNvoVideoPath ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsActiveNvoVideoPlaying(true)
                          logActivity({
                            type: 'video_lesson',
                            refId: `nvo-${activeNvoWork.id}`,
                            title: activeNvoWork.title,
                            meta: `Литература · 7. клас${activeNvoWork.author ? ` · ${activeNvoWork.author}` : ''}`,
                            href: `/dashboard/materials`,
                          })
                        }}
                        className="relative w-full overflow-hidden rounded-xl border border-border bg-white text-left group"
                        aria-label="Пусни видео урок"
                      >
                        <img
                          src={encodeURI(activeNvoWork.image)}
                          alt={activeNvoWork.title}
                          className="w-full max-h-[70vh] object-contain bg-white"
                        />
                        <span className="absolute inset-0 bg-slate-950/10 transition-colors group-hover:bg-slate-950/20" />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="inline-flex items-center gap-3 rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-[#1E4D7B] shadow-lg transition-transform group-hover:scale-105">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E4D7B] text-white">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                            Пусни видео урок
                          </span>
                        </span>
                      </button>
                    ) : (
                      <img
                        src={encodeURI(activeNvoWork.image)}
                        alt={activeNvoWork.title}
                        className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-white"
                      />
                    )}
                  </div>
                  <div className="p-4 md:p-6 bg-white flex flex-col justify-center gap-3">
                    <button type="button" onClick={() => handleNvoWorkPanelChange('text')} className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 px-4">Текст</button>
                    <button type="button" onClick={() => handleNvoWorkPanelChange('summary')} className="w-full rounded-xl bg-[#74A5D4] text-white text-sm font-semibold py-3 px-4">{hasPremiumAccess || isActiveNvoWorkFree ? 'Резюме' : 'Резюме • Премиум'}</button>
                    <button type="button" onClick={() => handleNvoWorkPanelChange('video')} className="w-full rounded-xl bg-[#1E4D7B] text-white text-sm font-semibold py-3 px-4">{hasPremiumAccess || isActiveNvoWorkFree ? 'Видео урок' : 'Видео урок • Премиум'}</button>
                    <button type="button" onClick={() => handleNvoWorkPanelChange('exercise')} className="w-full rounded-xl bg-[#C46A28] text-white text-sm font-semibold py-3 px-4">{hasPremiumAccess || isActiveNvoWorkFree ? 'Упражнение' : 'Упражнение • Премиум'}</button>
                    {activeNvoWorkPanel === 'video' && !activeNvoVideoPath && (
                      <p className="text-xs text-text-muted">Няма налично видео за това произведение.</p>
                    )}
                    {activeNvoWorkPanel === 'exercise' && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePremiumAction(
                            () => {
                              setActiveNvoWorkId(null)
                              router.push(`/dashboard/literature-exercise/${activeNvoWork.id}`)
                            },
                            isActiveNvoWorkFree
                          )
                        }
                        className="w-full rounded-xl border border-border bg-white text-text text-sm font-semibold py-2.5 px-4 hover:bg-[#F8FBFF] transition-colors"
                      >
                        Отвори упражнението
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Материали" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="hidden md:block" />

          <div className="flex flex-wrap justify-center gap-2">
            {grade12Sections.map((section) => {
              const isActive = selectedSection === section
              const theme = grade12SectionTheme[section as keyof typeof grade12SectionTheme]

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setSelectedSection(section)}
                  style={
                    isActive
                      ? { backgroundColor: theme.accent, borderColor: theme.accent, color: '#ffffff' }
                      : undefined
                  }
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                    isActive ? '' : 'bg-white text-text border-border hover:bg-slate-50'
                  )}
                >
                  <span>{sectionLabels[section]}</span>
                </button>
              )
            })}
          </div>

          <div className="flex justify-center md:justify-end">
            <label className="relative w-full max-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Търси"
                className="w-full rounded-xl border border-border bg-white py-1.5 pl-8 pr-2 text-xs text-text placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </div>

        {selectedSection === 'literature' ? (
          <div
            className="rounded-2xl border p-4 md:p-5"
            style={{
              backgroundColor: subjectTheme.literature.sectionBg,
              borderColor: subjectTheme.literature.sectionBorder,
            }}
          >
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{filteredLiteratureCount}</strong> творби
            </p>

            <div className="space-y-6">
              {literatureGroups.map(({ theme, works }, themeIndex) => (
                <section key={theme}>
                  <h3
                    className="text-sm md:text-base font-semibold text-center mb-3"
                    style={{ color: subjectTheme.literature.headerText }}
                  >
                    {themeIndex + 1}. {stripRomanNumeralPrefix(theme)}
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {works.map((work) => {
                      const isFreeItem = isFreeLiteratureWork(work.id)
                      return (
                      <button
                        key={work.id}
                        type="button"
                        onClick={() => setActiveWorkId(work.id)}
                        className={cn('relative rounded-xl border border-border bg-white p-4 text-left transition-transform duration-200 hover:-translate-y-0.5', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                      >
                        {!hasPremiumAccess && !isFreeItem && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="amber">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                              Премиум
                            </Badge>
                          </div>
                        )}
                        <p className="text-xs font-semibold text-text-muted mb-1">{work.author}</p>
                        <h3 className="font-semibold text-text text-sm leading-snug mb-3">{work.title}</h3>
                        <img
                          src={encodeURI(work.image)}
                          alt={work.title}
                          className="w-full h-auto object-contain rounded-lg border border-border"
                        />
                        <p className="mt-3 text-xs font-semibold text-primary">Отвори произведението</p>
                      </button>
                      )
                    })}
                  </div>
                </section>
              ))}

              {filteredLiteratureCount === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени произведения</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedSection === 'bulgarian' ? (
          <div
            className="rounded-2xl border p-4 md:p-5"
            style={{
              backgroundColor: grade12SectionTheme.bulgarian.sectionBg,
              borderColor: grade12SectionTheme.bulgarian.sectionBorder,
            }}
          >
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{bulgarianRulesCount}</strong> правила и термини
            </p>

            <div className="space-y-6">
              {bulgarianRuleGroups.map((section, sectionIndex) => {
                const sectionLabel = sentenceCase(section.title)
                return (
                <section key={section.title}>
                  <h3
                    className="text-sm md:text-base font-semibold text-center mb-3"
                    style={{ color: subjectTheme.bulgarian.headerText }}
                  >
                    {sectionIndex + 1}. {sectionLabel}
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    {section.items.map((item, itemIndex) => {
                      const globalIdx = ruleTopicIndex[section.title]?.[item] ?? -1
                      const key = `${section.title}-${item}`
                      const isFreeItem = isFreeBelDziRule(globalIdx)

                      return (
                        <div
                          key={key}
                          className={cn('relative h-full min-h-[220px] rounded-xl border bg-white p-5 text-left transition-transform duration-200 hover:-translate-y-0.5 flex flex-col', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                          style={{ borderColor: subjectTheme.bulgarian.cardBorder }}
                        >
                          {!hasPremiumAccess && !isFreeItem && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="amber">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Премиум
                              </Badge>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-muted mb-1">
                              {sectionLabel}
                            </p>
                            <h3 className="font-sans font-semibold text-text text-[15px] leading-snug tracking-normal mb-3 break-words">
                              {item}
                            </h3>
                            <p
                              className="font-sans text-sm font-semibold tracking-normal mb-4"
                              style={{ color: subjectTheme.bulgarian.accent, opacity: 0.8 }}
                            >
                              Правило #{itemIndex + 1}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-auto">
                            <button
                              type="button"
                              onClick={() =>
                                handlePremiumAction(
                                  () => setTheoryIndex(globalIdx),
                                  isFreeBelDziRule(globalIdx)
                                )
                              }
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = subjectTheme.bulgarian.outlineHoverBg }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
                              className="flex-1 rounded-lg border bg-white text-sm font-bold py-3 transition-colors"
                              style={{
                                borderColor: subjectTheme.bulgarian.outlineBorder,
                                color: subjectTheme.bulgarian.outlineText,
                              }}
                            >
                              Теория
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handlePremiumAction(
                                  () => router.push(`/dashboard/materials/rule/${globalIdx}`),
                                  isFreeBelDziRule(globalIdx)
                                )
                              }
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = subjectTheme.bulgarian.outlineHoverBg }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
                              className="flex-1 rounded-lg border bg-white text-sm font-bold py-3 transition-colors"
                              style={{
                                borderColor: subjectTheme.bulgarian.outlineBorder,
                                color: subjectTheme.bulgarian.outlineText,
                              }}
                            >
                              Тест
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )})}

              {bulgarianRulesCount === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени правила</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedSection === 'essay' ? (
          <div
            className="rounded-2xl border p-4 md:p-5"
            style={{
              backgroundColor: grade12SectionTheme.essay.sectionBg,
              borderColor: grade12SectionTheme.essay.sectionBorder,
            }}
          >
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{dziEssayMaterialsCount}</strong> материала
            </p>
            <div className="space-y-6">
              {filteredDziEssayMaterialGroups.length > 0 ? (
                <>
                  {filteredDziEssayMaterialGroups.map((group, groupIndex) => (
                    <section key={group.title}>
                      <h3
                        className="text-sm md:text-base font-semibold text-center mb-2"
                        style={{ color: grade12SectionTheme.essay.headerText }}
                      >
                        {groupIndex + 1}. {group.title}
                      </h3>
                      <p className="text-xs text-text-muted text-center mb-3">{group.description}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((item) => {
                          const isFreeItem = isFreeDziEssayMaterial(item.id)
                          return (
                            <div
                              key={item.id}
                              className={cn('relative p-4 flex flex-col gap-3 rounded-xl bg-white border', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                              style={{ borderColor: grade12SectionTheme.essay.cardBorder }}
                            >
                              {!hasPremiumAccess && !isFreeItem && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="amber">
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    Премиум
                                  </Badge>
                                </div>
                              )}
                              {isFreeItem && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="success">Свободен</Badge>
                                </div>
                              )}
                              <div className="pr-20">
                                <p
                                  className="text-xs font-semibold mb-1 uppercase tracking-wide"
                                  style={{ color: grade12SectionTheme.essay.headerText, opacity: 0.75 }}
                                >
                                  {item.group}
                                </p>
                                <h3 className="font-semibold text-text text-sm leading-snug">{item.title}</h3>
                              </div>
                              <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
                              <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => openDziEssayMaterial(item)}
                                  className="rounded-lg border bg-white px-3 py-3 text-sm font-bold transition-colors hover:bg-[#D4EFEA]"
                                  style={{
                                    borderColor: grade12SectionTheme.essay.outlineBorder,
                                    color: grade12SectionTheme.essay.outlineText,
                                  }}
                                >
                                  Теория
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDziEssayTest(item)}
                                  className="rounded-lg border bg-white px-3 py-3 text-sm font-bold transition-colors hover:bg-[#D4EFEA]"
                                  style={{
                                    borderColor: grade12SectionTheme.essay.outlineBorder,
                                    color: grade12SectionTheme.essay.outlineText,
                                  }}
                                >
                                  Тест
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </>
              ) : (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени материали</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedSection === 'english' ? (
          <div
            className="rounded-2xl border p-4 md:p-5"
            style={{
              backgroundColor: grade12SectionTheme.english.sectionBg,
              borderColor: grade12SectionTheme.english.sectionBorder,
            }}
          >
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{englishMaterialsCount}</strong> материала
            </p>
            <div className="space-y-6">
              {filteredEnglishMaterialGroups.length > 0 ? (
                <>
                  {filteredEnglishMaterialGroups.map((group, groupIndex) => (
                    <section key={group.title}>
                      <h3
                        className="text-sm md:text-base font-semibold text-center mb-2"
                        style={{ color: grade12SectionTheme.english.headerText }}
                      >
                        {groupIndex + 1}. {group.title}
                      </h3>
                      <p className="text-xs text-text-muted text-center mb-3">{group.description}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((item) => {
                          const isFreeItem = isFreeEnglishDziMaterial(item.title)
                          return (
                          <div
                            key={item.title}
                            className={cn('relative p-4 flex flex-col gap-3 rounded-xl bg-white border', !hasPremiumAccess && !isFreeItem && 'opacity-60')}
                            style={{ borderColor: grade12SectionTheme.english.cardBorder }}
                          >
                            {!hasPremiumAccess && !isFreeItem && (
                              <div className="absolute top-2 right-2">
                                <Badge variant="amber">
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                  Премиум
                                </Badge>
                              </div>
                            )}
                            <div>
                              <p
                                className="text-xs font-semibold mb-1 uppercase tracking-wide"
                                style={{ color: grade12SectionTheme.english.headerText, opacity: 0.75 }}
                              >
                                {group.title}
                              </p>
                              <h3 className="font-semibold text-text text-sm leading-snug">{item.title}</h3>
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
                            <div className="mt-auto space-y-2">
                              {item.textHref && (
                                <button
                                  type="button"
                                  onClick={() => openEnglishMaterial(item)}
                                  className="w-full text-left text-xs font-semibold py-2 rounded-lg bg-white border transition-colors px-3"
                                  style={{
                                    borderColor: grade12SectionTheme.english.outlineBorder,
                                    color: grade12SectionTheme.english.outlineText,
                                  }}
                                >
                                  Отвори
                                </button>
                              )}
                              {item.imageSrcs && item.imageSrcs.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePremiumAction(
                                      () => openImageGallery(item.imageSrcs!, item.title),
                                      isFreeEnglishDziMaterial(item.title)
                                    )
                                  }
                                  className="w-full text-left text-xs font-semibold py-2 rounded-lg bg-white border transition-colors px-3"
                                  style={{
                                    borderColor: grade12SectionTheme.english.outlineBorder,
                                    color: grade12SectionTheme.english.outlineText,
                                  }}
                                >
                                  Отвори пример
                                </button>
                              )}
                            </div>
                          </div>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </>
              ) : (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени материали</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{filtered.length}</strong> материала
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((material) => (
                <div key={material.id} className={cn(
                  'rounded-xl border border-border bg-white transition-all duration-200 hover:-translate-y-0.5 p-5 flex flex-col gap-3',
                  material.access === 'premium' && 'border-amber/20'
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                      typeColors[material.type]
                    )}>
                      {typeIcons[material.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={cn('badge text-[10px]', typeColors[material.type])}>
                          {materialTypeLabels[material.type]}
                        </span>
                        {material.access === 'premium' && (
                          <span className="badge badge-amber text-[10px]">Премиум</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-text text-sm leading-snug">{material.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{material.description}</p>

                  <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                    <span>{material.subjectName}</span>
                    <div className="flex items-center gap-2">
                      {material.pages && <span>{material.pages} стр.</span>}
                      <span>{material.downloadCount.toLocaleString()} изтегляния</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!hasPremiumAccess || material.access === 'premium') {
                        redirectToSubscription()
                      }
                    }}
                    className={cn(
                      'w-full text-xs font-semibold py-2 rounded-lg transition-colors',
                      !hasPremiumAccess || material.access === 'premium'
                        ? 'bg-amber-light text-amber border border-amber/20 hover:bg-amber/20'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    )}
                  >
                    {!hasPremiumAccess || material.access === 'premium' ? 'Отключи с Премиум' : 'Отвори материала'}
                  </button>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-text-muted">
                <p className="font-medium mb-1">Няма намерени материали</p>
                <p className="text-sm">Този раздел е празен в момента.</p>
              </div>
            )}
          </>
        )}
      </div>

      {activeEnglishMaterial && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
          onClick={() => setActiveEnglishMaterial(null)}
        >
          <div
            className="w-full max-w-6xl h-[86vh] rounded-2xl bg-white border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-text">{activeEnglishMaterial.title}</h3>
                <p className="text-sm text-text-muted mt-1">{activeEnglishMaterial.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEnglishMaterial(null)}
                className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Затвори"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-[calc(86vh-100px)] overflow-y-auto bg-[#F8FBFF] p-5 md:p-6">
              {englishMaterialLoading && (
                <p className="text-sm text-text-muted">Зареждане на материала...</p>
              )}
              {!englishMaterialLoading && englishMaterialError && (
                <p className="text-sm text-danger">{englishMaterialError}</p>
              )}
              {!englishMaterialLoading && !englishMaterialError && englishMaterialText && (
                <pre className="whitespace-pre-wrap break-words text-[15px] leading-7 text-text font-sans">
                  {englishMaterialText}
                </pre>
              )}
              {!englishMaterialLoading && !englishMaterialError && !englishMaterialText && activeEnglishMaterial.imageSrcs && (
                <div className="space-y-4">
                  {activeEnglishMaterial.imageSrcs.map((src, index) => (
                    <button
                      key={`${activeEnglishMaterial.title}-${index}`}
                      type="button"
                      onClick={() => {
                        setFullscreenImageSrc(src)
                        setFullscreenImageZoom(1)
                      }}
                      className="block w-full rounded-xl border border-border bg-white overflow-hidden group relative"
                      aria-label="Отвори на цял екран"
                    >
                      <img
                        src={src}
                        alt={`${activeEnglishMaterial.title} - ${index + 1}`}
                        className="w-full h-auto"
                      />
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-lg bg-black/60 text-white text-xs font-semibold px-2 py-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" />
                        </svg>
                        Цял екран
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeDziEssayMaterial && (
        <DziEssayMaterialModal
          material={activeDziEssayMaterial}
          onClose={() => setActiveDziEssayMaterial(null)}
        />
      )}

      {activeWork && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-start lg:items-center justify-center overflow-y-auto"
          onClick={() => setActiveWorkId(null)}
        >
          <div
            className="w-full max-w-5xl rounded-2xl bg-white border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Литература</p>
                <h3 className="text-lg md:text-xl font-bold text-text">{activeWork.title}</h3>
                <p className="text-sm text-text-muted mt-1">{activeWork.author}</p>
                <p className="text-xs text-text-muted mt-1">{activeWork.theme}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveWorkId(null)}
                className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label="Затвори"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1.2fr_0.8fr] rounded-xl border border-border overflow-hidden">
                <div className="p-4 md:p-6 bg-[#F8FBFF] border-t lg:border-t-0 lg:border-r border-border">
                  {activeWorkPanel === 'text' ? (
                    <div className="flex h-[60vh] max-h-[60vh] lg:h-[70vh] lg:max-h-[70vh] flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsWorkReadingMarkerEnabled((prev) => !prev)}
                          className={cn(
                            'w-7 h-7 rounded-full border flex items-center justify-center transition-colors',
                            isWorkReadingMarkerEnabled
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-text-muted border-border hover:text-text hover:bg-gray-50'
                          )}
                          aria-label={isWorkReadingMarkerEnabled ? 'Изключи маркиране' : 'Включи маркиране'}
                          title={isWorkReadingMarkerEnabled ? 'Изключи маркиране' : 'Включи маркиране'}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <p className="text-xs font-medium text-text-muted">Маркирай до къде си стигнал</p>
                      </div>

                      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-white p-4">
                        {activeWorkTextLoading ? (
                          <p className="text-sm text-text-muted">Зареждане...</p>
                        ) : activeWorkTextError ? (
                          <p className="text-sm text-danger">{activeWorkTextError}</p>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-text font-sans">
                            {(() => {
                              let wordIndex = -1
                              return activeWorkTextTokens.map((token, idx) => {
                                if (/^\s+$/.test(token)) {
                                  return <span key={`work-space-${idx}`}>{token}</span>
                                }

                                wordIndex += 1
                                const currentWordIndex = wordIndex
                                const isMarked = activeWorkMarkedWordIndex === currentWordIndex

                                return (
                                  <span
                                    key={`work-word-${idx}-${currentWordIndex}`}
                                    ref={(el) => {
                                      workWordRefs.current[currentWordIndex] = el
                                    }}
                                    onClick={() => handleWorkWordMark(currentWordIndex)}
                                    className={cn(
                                      'rounded-sm',
                                      isMarked && 'bg-amber-200 px-0.5',
                                      isWorkReadingMarkerEnabled && 'cursor-pointer hover:bg-amber-100'
                                    )}
                                  >
                                    {token}
                                  </span>
                                )
                              })
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : activeWorkPanel === 'summary' ? (
                    <div className="w-full max-h-[60vh] lg:max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-white p-4">
                      <h4 className="text-sm font-semibold text-[#1E4D7B] mb-3">„{activeWork.title}“</h4>
                      {activeWorkSummary.length > 0 ? (
                        <div className="space-y-2 text-sm leading-7 text-text">
                          {activeWorkSummary.map((sentence, index) => (
                            <p key={`${activeWork.id}-summary-${index}`}>{sentence}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">Резюмето за това произведение все още не е добавено.</p>
                      )}
                    </div>
                  ) : activeWorkPanel === 'video' && activeWorkVideoPath && isActiveWorkVideoPlaying ? (
                    <video
                      key={activeWorkVideoPath}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      poster={encodeURI(activeWork.image)}
                      className="w-full max-h-[70vh] rounded-xl border border-border bg-black"
                    >
                      <source src={encodeURI(activeWorkVideoPath)} type="video/mp4" />
                      Браузърът не поддържа видео.
                    </video>
                  ) : activeWorkPanel === 'video' && activeWorkVideoPath ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsActiveWorkVideoPlaying(true)
                        logActivity({
                          type: 'video_lesson',
                          refId: `dzi-${activeWork.id}`,
                          title: activeWork.title,
                          meta: `Литература · 12. клас${activeWork.author ? ` · ${activeWork.author}` : ''}`,
                          href: `/dashboard/materials`,
                        })
                      }}
                      className="relative w-full overflow-hidden rounded-xl border border-border bg-white text-left group"
                      aria-label="Пусни видео урок"
                    >
                      <img
                        src={encodeURI(activeWork.image)}
                        alt={activeWork.title}
                        className="w-full max-h-[70vh] object-contain bg-white"
                      />
                      <span className="absolute inset-0 bg-slate-950/10 transition-colors group-hover:bg-slate-950/20" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-3 rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-[#1E4D7B] shadow-lg transition-transform group-hover:scale-105">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E4D7B] text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                          Пусни видео урок
                        </span>
                      </span>
                    </button>
                  ) : (
                    <img
                      src={encodeURI(activeWork.image)}
                      alt={activeWork.title}
                      className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-white"
                    />
                  )}
                </div>
                <div className="p-4 md:p-6 bg-white flex flex-col justify-center gap-3">
                  <button type="button" onClick={() => handleWorkPanelChange('text')} className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 px-4">Текст</button>
                  <button type="button" onClick={() => handleWorkPanelChange('summary')} className="w-full rounded-xl bg-[#74A5D4] text-white text-sm font-semibold py-3 px-4">{hasPremiumAccess || isActiveWorkFree ? 'Резюме' : 'Резюме • Премиум'}</button>
                  <button type="button" onClick={() => handleWorkPanelChange('video')} className="w-full rounded-xl bg-[#1E4D7B] text-white text-sm font-semibold py-3 px-4">{hasPremiumAccess || isActiveWorkFree ? 'Видео урок' : 'Видео урок • Премиум'}</button>
                  <button type="button" onClick={() => handleWorkPanelChange('exercise')} className="w-full rounded-xl bg-[#C46A28] text-white text-sm font-semibold py-3 px-4">{hasPremiumAccess || isActiveWorkFree ? 'Упражнение' : 'Упражнение • Премиум'}</button>
                  {activeWorkPanel === 'video' && !activeWorkVideoPath && (
                    <p className="text-xs text-text-muted">Няма налично видео за това произведение.</p>
                  )}
                  {activeWorkPanel === 'exercise' && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePremiumAction(
                          () => {
                            setActiveWorkId(null)
                            router.push(`/dashboard/literature-exercise/${activeWork.id}`)
                          },
                          isActiveWorkFree
                        )
                      }
                      className="w-full rounded-xl border border-border bg-white text-text text-sm font-semibold py-2.5 px-4 hover:bg-[#F8FBFF] transition-colors"
                    >
                      Отвори упражнението
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {theoryIndex !== null && belTheory[theoryIndex] && (() => {
        const t = belTheory[theoryIndex]
        return (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
            onClick={() => setTheoryIndex(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white border border-border shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Теория</p>
                  <h3 className="text-base font-bold text-text leading-snug">{t.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTheoryIndex(null)}
                  className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
                  aria-label="Затвори"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-xl bg-[#F2F8FF] border border-[#D7E7F7] p-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Правило</p>
                  <p className="text-sm text-text leading-relaxed">{t.rule}</p>
                </div>

                <div className="rounded-xl bg-success/5 border border-success/20 p-4">
                  <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">Пример</p>
                  <p className="text-sm text-text font-medium">{t.example}</p>
                </div>

                <div className="rounded-xl bg-danger/5 border border-danger/20 p-4">
                  <p className="text-xs font-semibold text-danger uppercase tracking-wide mb-1">Типична грешка</p>
                  <p className="text-sm text-text leading-relaxed">{t.commonMistake}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePremiumAction(
                      () => {
                        setTheoryIndex(null)
                        router.push(`/dashboard/materials/rule/${theoryIndex}`)
                      },
                      theoryIndex !== null && isFreeBelDziRule(theoryIndex)
                    )
                  }
                  className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 hover:bg-primary-dark transition-colors"
                >
                  Направи теста →
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {fullscreenImageSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => (fullscreenImageGallery ? closeImageGallery() : setFullscreenImageSrc(null))}
        >
          <div
            className="relative w-full h-full flex items-center justify-center overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImageSrc}
              alt={fullscreenImageTitle || 'Преглед на цял екран'}
              style={{ transform: `scale(${fullscreenImageZoom})`, transformOrigin: 'center center' }}
              className="max-w-full max-h-full object-contain transition-transform duration-150 select-none"
              draggable={false}
            />
          </div>

          {fullscreenImageGallery && fullscreenImageGallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToGalleryIndex(fullscreenImageIndex - 1) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-text flex items-center justify-center shadow-lg transition-colors"
                aria-label="Предишна снимка"
                title="Предишна снимка"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToGalleryIndex(fullscreenImageIndex + 1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-text flex items-center justify-center shadow-lg transition-colors"
                aria-label="Следваща снимка"
                title="Следваща снимка"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 text-text text-xs font-semibold shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {fullscreenImageIndex + 1} / {fullscreenImageGallery.length}
              </div>
            </>
          )}

          {fullscreenImageTitle && (
            <div
              className="absolute top-4 left-4 max-w-[60%] px-3 py-1.5 rounded-lg bg-white/90 text-text text-xs font-semibold shadow-lg truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {fullscreenImageTitle}
            </div>
          )}

          <div
            className="absolute top-4 right-4 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreenImageZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-text flex items-center justify-center shadow-lg transition-colors"
              aria-label="Намали"
              title="Намали"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3M8 11h6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setFullscreenImageZoom(1)}
              className="h-10 px-3 rounded-full bg-white/90 hover:bg-white text-text text-xs font-semibold shadow-lg transition-colors"
              aria-label="Нулирай зум"
              title="Нулирай зум"
            >
              {Math.round(fullscreenImageZoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setFullscreenImageZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-text flex items-center justify-center shadow-lg transition-colors"
              aria-label="Увеличи"
              title="Увеличи"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => (fullscreenImageGallery ? closeImageGallery() : setFullscreenImageSrc(null))}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-text flex items-center justify-center shadow-lg transition-colors"
              aria-label="Затвори"
              title="Затвори"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
