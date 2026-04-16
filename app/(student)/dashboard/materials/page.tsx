'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { materials, materialTypeLabels, type MaterialType } from '@/data/materials'
import { literatureThemeOrder, literatureWorks } from '@/data/literatureWorks'
import { literatureSummaries } from '@/data/literatureSummaries'
import { literatureWorkTextPaths } from '@/data/literatureWorkTexts'
import { nvoLiteratureThemeOrder, nvoLiteratureWorks } from '@/data/nvoLiteratureWorks'
import { nvoLiteratureVideoPaths } from '@/data/nvoLiteratureVideoPaths'
import { nvoLiteratureWorkTextPaths } from '@/data/nvoLiteratureWorkTexts'
import { bulgarianRuleSections } from '@/data/bulgarianRules'
import { belTheory } from '@/data/bel-theory'
import math7ProblemBank from '@/data/nvo_7_math_generated_problem_bank.json'
import topicsData from '@/data/bel_curriculum_topics_content.json'
import { useGrade } from '@/lib/grade-context'
import { cn } from '@/lib/utils'

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
const math7ProblemCount = math7Topics.reduce(
  (total, topic) => total + topic.subtopics.reduce((sum, subtopic) => sum + subtopic.problems.length, 0),
  0
)
const math7ShortAnswerCount = math7Topics.reduce(
  (total, topic) =>
    total + topic.subtopics.reduce(
      (sum, subtopic) => sum + subtopic.problems.filter((problem) => problem.type === 'short_answer').length,
      0
    ),
  0
)

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

type MaterialSection = 'bulgarian' | 'literature' | 'math' | 'english'

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
}

const grade12Sections: MaterialSection[] = ['bulgarian', 'literature', 'english']

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
type Grade7Section = typeof grade7Sections[number]
type WorkPanel = 'text' | 'summary' | 'video' | 'exercise'
const NVO_READING_PROGRESS_STORAGE_KEY = 'nvo-literature-reading-progress-v1'

const grade7SectionLabels: Record<Grade7Section, string> = {
  bulgarian: 'Български език',
  literature: 'Литература',
  math: 'Математика',
}

export default function MaterialsPage() {
  const { grade } = useGrade()
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState<MaterialSection>('bulgarian')
  const [grade7Section, setGrade7Section] = useState<Grade7Section>('bulgarian')
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)
  const [activeNvoWorkId, setActiveNvoWorkId] = useState<string | null>(null)
  const [activeWorkText, setActiveWorkText] = useState<string>('')
  const [activeWorkTextLoading, setActiveWorkTextLoading] = useState(false)
  const [activeWorkTextError, setActiveWorkTextError] = useState<string | null>(null)
  const [activeNvoWorkText, setActiveNvoWorkText] = useState<string>('')
  const [activeNvoWorkTextLoading, setActiveNvoWorkTextLoading] = useState(false)
  const [activeNvoWorkTextError, setActiveNvoWorkTextError] = useState<string | null>(null)
  const [isNvoReadingMarkerEnabled, setIsNvoReadingMarkerEnabled] = useState(false)
  const [nvoReadingProgressByWork, setNvoReadingProgressByWork] = useState<Record<string, number>>({})
  const [activeWorkPanel, setActiveWorkPanel] = useState<WorkPanel>('video')
  const [activeNvoWorkPanel, setActiveNvoWorkPanel] = useState<WorkPanel>('video')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRuleKey, setExpandedRuleKey] = useState<string | null>(null)
  const [theoryIndex, setTheoryIndex] = useState<number | null>(null)
  const [activeEnglishMaterial, setActiveEnglishMaterial] = useState<EnglishMaterial | null>(null)
  const [englishMaterialText, setEnglishMaterialText] = useState('')
  const [englishMaterialLoading, setEnglishMaterialLoading] = useState(false)
  const [englishMaterialError, setEnglishMaterialError] = useState<string | null>(null)
  const nvoWordRefs = useRef<Record<number, HTMLSpanElement | null>>({})

  const normalizedQuery = searchQuery.trim().toLowerCase()

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
  const activeNvoWork = nvoLiteratureWorks.find((w) => w.id === activeNvoWorkId)
  const activeNvoVideoPath = activeNvoWorkId ? nvoLiteratureVideoPaths[activeNvoWorkId] : undefined
  const activeNvoMarkedWordIndex = activeNvoWorkId ? nvoReadingProgressByWork[activeNvoWorkId] : undefined
  const activeNvoTextTokens = useMemo(() => activeNvoWorkText.split(/(\s+)/), [activeNvoWorkText])

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

  const openEnglishMaterial = async (material: EnglishMaterial) => {
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
    if (activeNvoWorkPanel !== 'text') return
    if (typeof activeNvoMarkedWordIndex !== 'number') return
    const target = nvoWordRefs.current[activeNvoMarkedWordIndex]
    if (!target) return

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [activeNvoWorkPanel, activeNvoMarkedWordIndex, activeNvoWorkText])

  useEffect(() => {
    if (activeWorkId) setActiveWorkPanel('video')
  }, [activeWorkId])

  useEffect(() => {
    if (activeNvoWorkId) {
      setActiveNvoWorkPanel('video')
      setIsNvoReadingMarkerEnabled(false)
    }
  }, [activeNvoWorkId])

  useEffect(() => {
    const allowedSections = grade === '7'
      ? (grade7Sections as readonly MaterialSection[])
      : grade12Sections

    if (!allowedSections.includes(selectedSection)) {
      setSelectedSection('bulgarian')
    }
  }, [grade, selectedSection])

  if (grade === '7') {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Материали" />
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {grade7Sections.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setGrade7Section(section)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                  grade7Section === section
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text border-border hover:bg-primary-light'
                )}
              >
                {grade7SectionLabels[section]}
              </button>
            ))}
          </div>
          <div className="flex justify-center md:justify-end mb-4">
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

          {grade7Section === 'bulgarian' ? (
            <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
              <p className="text-sm text-text-muted mb-4">
                Намерени: <strong className="text-text">{filteredBelCurriculumTopics.length}</strong> учебни теми
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBelCurriculumTopics.map(({ topic, topicIndex }) => {
                  const heading = topic.short_title ?? splitTopicTitle(topic.title).short
                  const subtitle = topic.subtitle ?? splitTopicTitle(topic.title).subtitle

                  return (
                    <div
                      key={topic.number}
                      className="min-h-[190px] rounded-sm border border-[#BCD6EF] bg-[#F2F8FF] p-5 text-left shadow-[8px_8px_0_rgba(30,77,123,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <h3 className="font-sans font-semibold text-text text-[15px] leading-snug tracking-normal mb-2">
                        {heading}
                      </h3>
                      {subtitle && (
                        <p className="font-sans text-[15px] font-semibold text-text leading-snug tracking-normal mb-4">
                          {subtitle}
                        </p>
                      )}
                      <p className="font-sans text-sm font-semibold text-primary/70 tracking-normal mb-4">
                        Тема #{topic.number}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/materials/curriculum-topic/${topicIndex}?view=theory`)}
                          className="flex-1 rounded-lg border border-[#AFC4DA] bg-transparent text-[#1E4D7B] text-sm font-bold py-3 hover:bg-[#1E4D7B]/10 transition-colors"
                        >
                          Теория
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/materials/curriculum-topic/${topicIndex}?view=exercise`)}
                          className="flex-1 rounded-lg bg-primary text-white text-sm font-bold py-3 hover:bg-primary-dark transition-colors"
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
            <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
              <p className="text-sm text-text-muted mb-4">
                Намерени: <strong className="text-text">{nvoLiteratureWorks.length}</strong> творби
              </p>
              <div className="space-y-6">
                {nvoLiteratureGroups.map(({ theme, works }, themeIndex) => (
                  <section key={theme}>
                    <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-3">
                      {themeIndex + 1}. {theme}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {works.map((work) => (
                        <button
                          key={work.id}
                          type="button"
                          onClick={() => setActiveNvoWorkId(work.id)}
                          className="card p-4 text-left transition-transform duration-200 hover:-translate-y-0.5"
                        >
                          <p className="text-xs font-semibold text-text-muted mb-1">{work.author}</p>
                          <h3 className="font-semibold text-text text-sm leading-snug mb-3">{work.title}</h3>
                          <img
                            src={encodeURI(work.image)}
                            alt={work.title}
                            className="w-full h-auto object-contain rounded-lg border border-border"
                          />
                          <p className="mt-3 text-xs font-semibold text-primary">Отвори произведението</p>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : grade7Section === 'math' ? (
            <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    Математика — 7. клас
                  </p>
                  <h2 className="text-lg md:text-xl font-bold text-text mb-2">
                    Материали по теми
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
                    Разгледай оригинални тренировъчни задачи по всички теми и подтеми от учебния обхват:
                    числа и алгебра, геометрия, вероятности, статистика и моделиране.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/materials/math-7-topics')}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  Отвори задачите
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {[
                  [String(math7Topics.length), 'теми'],
                  [String(math7Topics.reduce((sum, topic) => sum + topic.subtopics.length, 0)), 'подтеми'],
                  [String(math7ProblemCount), 'задачи'],
                  [String(math7ShortAnswerCount), 'кратки отговори'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-[#D7E7F7] bg-white p-4">
                    <p className="text-2xl font-bold text-text">{value}</p>
                    <p className="text-xs font-semibold text-text-muted">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-7 mt-6">
                {math7Topics.map((topic, topicIndex) => (
                  <section key={topic.id}>
                    <h3 className="text-sm md:text-base font-bold text-[#1E4D7B] mb-3">
                      {topicIndex + 1}. {topic.title}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topic.subtopics.map((subtopic, subtopicIndex) => (
                        <button
                          key={subtopic.id}
                          type="button"
                          onClick={() => router.push(`/dashboard/materials/math-7-topics?subtopic=${subtopic.id}`)}
                          className="min-h-[132px] rounded-lg border border-[#D7E7F7] bg-white p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                        >
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                            Подтема #{subtopicIndex + 1}
                          </p>
                          <h4 className="text-sm font-bold text-text leading-snug">
                            {subtopic.title}
                          </h4>
                          <p className="mt-4 text-xs font-semibold text-primary">
                            {subtopic.problems.length} задачи
                          </p>
                        </button>
                      ))}
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
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
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
                {activeNvoWorkPanel === 'text' ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setActiveNvoWorkPanel('text')} className="rounded-xl bg-primary text-white text-xs font-semibold py-2.5 px-4">Текст</button>
                      <button type="button" onClick={() => setActiveNvoWorkPanel('video')} className="rounded-xl bg-[#1E4D7B] text-white text-xs font-semibold py-2.5 px-4">Видео урок</button>
                      <button type="button" onClick={() => setActiveNvoWorkPanel('exercise')} className="rounded-xl bg-[#C46A28] text-white text-xs font-semibold py-2.5 px-4">Упражнение</button>
                    </div>
                    <div className="rounded-xl border border-border bg-[#F8FBFF] p-4 max-h-[70vh] overflow-y-auto">
                      <div className="mb-3 flex items-center gap-2">
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
                ) : (
                  <div className="grid lg:grid-cols-[1.2fr_0.8fr] rounded-xl border border-border overflow-hidden">
                    <div className="p-4 md:p-6 bg-[#F8FBFF] border-b lg:border-b-0 lg:border-r border-border">
                      {activeNvoWorkPanel === 'video' && activeNvoVideoPath ? (
                        <video
                          controls
                          preload="metadata"
                          className="w-full max-h-[70vh] rounded-xl border border-border bg-black"
                        >
                          <source src={encodeURI(activeNvoVideoPath)} type="video/mp4" />
                          Браузърът не поддържа видео.
                        </video>
                      ) : (
                        <img
                          src={encodeURI(activeNvoWork.image)}
                          alt={activeNvoWork.title}
                          className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-white"
                        />
                      )}
                    </div>
                    <div className="p-4 md:p-6 bg-white flex flex-col justify-center gap-3">
                      <button type="button" onClick={() => setActiveNvoWorkPanel('text')} className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 px-4">Текст</button>
                      <button type="button" onClick={() => setActiveNvoWorkPanel('video')} className="w-full rounded-xl bg-[#1E4D7B] text-white text-sm font-semibold py-3 px-4">Видео урок</button>
                      <button type="button" onClick={() => setActiveNvoWorkPanel('exercise')} className="w-full rounded-xl bg-[#C46A28] text-white text-sm font-semibold py-3 px-4">Упражнение</button>
                      {activeNvoWorkPanel === 'video' && !activeNvoVideoPath && (
                        <p className="text-xs text-text-muted">Няма налично видео за това произведение.</p>
                      )}
                      {activeNvoWorkPanel === 'exercise' && (
                        <Link
                          href={`/dashboard/literature-exercise/${activeNvoWork.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-white text-text text-sm font-semibold py-2.5 px-4 hover:bg-[#F8FBFF] transition-colors"
                        >
                          Отвори упражнението в нов таб
                        </Link>
                      )}
                    </div>
                  </div>
                )}
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

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setSelectedSection(section)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text border-border hover:bg-primary-light'
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
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{filteredLiteratureCount}</strong> творби
            </p>

            <div className="space-y-6">
              {literatureGroups.map(({ theme, works }, themeIndex) => (
                <section key={theme}>
                  <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-3">
                    {themeIndex + 1}. {theme}
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {works.map((work) => (
                      <button
                        key={work.id}
                        type="button"
                        onClick={() => setActiveWorkId(work.id)}
                        className="card p-4 text-left transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <p className="text-xs font-semibold text-text-muted mb-1">{work.author}</p>
                        <h3 className="font-semibold text-text text-sm leading-snug mb-3">{work.title}</h3>
                        <img
                          src={encodeURI(work.image)}
                          alt={work.title}
                          className="w-full h-auto object-contain rounded-lg border border-border"
                        />
                        <p className="mt-3 text-xs font-semibold text-primary">Отвори произведението</p>
                      </button>
                    ))}
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
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{bulgarianRulesCount}</strong> правила и термини
            </p>

            <div className="space-y-6">
              {bulgarianRuleGroups.map((section, sectionIndex) => (
                <section key={section.title}>
                  <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-3">
                    {sectionIndex + 1}. {section.title}
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.items.map((item, itemIndex) => {
                      const globalIdx = ruleTopicIndex[section.title]?.[item] ?? -1
                      const key = `${section.title}-${item}`
                      const isExpanded = expandedRuleKey === key

                      return (
                        <div key={key} className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedRuleKey(isExpanded ? null : key)}
                            className={cn(
                              'card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 w-full',
                              isExpanded && 'border-primary/40 bg-primary/5'
                            )}
                          >
                            <p className="text-xs font-semibold text-text-muted mb-1">
                              {section.title}
                            </p>
                            <h3 className="font-semibold text-text text-sm leading-snug mb-3">
                              {item}
                            </h3>
                            <p className="text-xs font-semibold text-primary">
                              Правило #{itemIndex + 1}
                            </p>
                          </button>

                          {isExpanded && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setTheoryIndex(globalIdx)}
                                className="flex-1 rounded-xl border border-[#1E4D7B]/30 bg-[#F2F8FF] text-[#1E4D7B] text-xs font-semibold py-2 hover:bg-[#1E4D7B]/10 transition-colors"
                              >
                                Теория
                              </button>
                              <button
                                type="button"
                                onClick={() => router.push(`/dashboard/materials/rule/${globalIdx}`)}
                                className="flex-1 rounded-xl bg-primary text-white text-xs font-semibold py-2 hover:bg-primary-dark transition-colors"
                              >
                                Тест
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}

              {bulgarianRulesCount === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени правила</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedSection === 'english' ? (
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
            <div className="text-center mb-5">
              <h2 className="text-3xl font-extrabold text-[#1E4D7B] leading-none tracking-tight">Материали 12 клас</h2>
              <p className="text-sm text-text-muted mt-1">Английски език</p>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Намерени: <strong className="text-text">{englishMaterialsCount}</strong> материала
            </p>
            <div className="space-y-6">
              {filteredEnglishMaterialGroups.length > 0 ? (
                <>
                  {filteredEnglishMaterialGroups.map((group, groupIndex) => (
                    <section key={group.title}>
                      <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-2">
                        {groupIndex + 1}. {group.title}
                      </h3>
                      <p className="text-xs text-text-muted text-center mb-3">{group.description}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((item) => (
                          <div key={item.title} className="card p-4 flex flex-col gap-3">
                            <div>
                              <p className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wide">
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
                                  className="w-full text-left text-xs font-semibold py-2 rounded-lg bg-white border border-border text-primary hover:bg-primary/5 transition-colors px-3"
                                >
                                  Отвори
                                </button>
                              )}
                              {item.imageSrcs && item.imageSrcs.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => openEnglishMaterial(item)}
                                  className="w-full text-left text-xs font-semibold py-2 rounded-lg bg-white border border-border text-primary hover:bg-primary/5 transition-colors px-3"
                                >
                                  Отвори пример
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
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
                  'card-hover p-5 flex flex-col gap-3',
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
                    className={cn(
                      'w-full text-xs font-semibold py-2 rounded-lg transition-colors',
                      material.access === 'premium'
                        ? 'bg-amber-light text-amber border border-amber/20 hover:bg-amber/20'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    )}
                  >
                    {material.access === 'premium' ? 'Отключи с Премиум' : 'Отвори материала'}
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
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">12. клас · Английски</p>
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
                    <img
                      key={`${activeEnglishMaterial.title}-${index}`}
                      src={src}
                      alt={`${activeEnglishMaterial.title} - ${index + 1}`}
                      className="w-full h-auto rounded-xl border border-border bg-white"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeWork && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
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
              {activeWorkPanel === 'text' ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setActiveWorkPanel('text')} className="rounded-xl bg-primary text-white text-xs font-semibold py-2.5 px-4">Текст</button>
                    <button type="button" onClick={() => setActiveWorkPanel('summary')} className="rounded-xl bg-[#74A5D4] text-white text-xs font-semibold py-2.5 px-4">Резюме</button>
                    <button type="button" onClick={() => setActiveWorkPanel('video')} className="rounded-xl bg-[#1E4D7B] text-white text-xs font-semibold py-2.5 px-4">Видео урок</button>
                    <button type="button" onClick={() => setActiveWorkPanel('exercise')} className="rounded-xl bg-[#C46A28] text-white text-xs font-semibold py-2.5 px-4">Упражнение</button>
                  </div>
                  <div className="rounded-xl border border-border bg-[#F8FBFF] p-4 max-h-[70vh] overflow-y-auto">
                    {activeWorkTextLoading ? (
                      <p className="text-sm text-text-muted">Зареждане...</p>
                    ) : activeWorkTextError ? (
                      <p className="text-sm text-danger">{activeWorkTextError}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-text font-sans">
                        {activeWorkText}
                      </pre>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1.2fr_0.8fr] rounded-xl border border-border overflow-hidden">
                  <div className="p-4 md:p-6 bg-[#F8FBFF] border-b lg:border-b-0 lg:border-r border-border">
                    {activeWorkPanel === 'summary' ? (
                      <div className="w-full max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-white p-4">
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
                    ) : (
                      <img
                        src={encodeURI(activeWork.image)}
                        alt={activeWork.title}
                        className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-white"
                      />
                    )}
                  </div>
                  <div className="p-4 md:p-6 bg-white flex flex-col justify-center gap-3">
                    <button type="button" onClick={() => setActiveWorkPanel('text')} className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 px-4">Текст</button>
                    <button type="button" onClick={() => setActiveWorkPanel('summary')} className="w-full rounded-xl bg-[#74A5D4] text-white text-sm font-semibold py-3 px-4">Резюме</button>
                    <button type="button" onClick={() => setActiveWorkPanel('video')} className="w-full rounded-xl bg-[#1E4D7B] text-white text-sm font-semibold py-3 px-4">Видео урок</button>
                    <button type="button" onClick={() => setActiveWorkPanel('exercise')} className="w-full rounded-xl bg-[#C46A28] text-white text-sm font-semibold py-3 px-4">Упражнение</button>
                    {activeWorkPanel === 'exercise' && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWorkId(null)
                          router.push('/dashboard/tests')
                        }}
                        className="w-full rounded-xl border border-border bg-white text-text text-sm font-semibold py-2.5 px-4 hover:bg-[#F8FBFF] transition-colors"
                      >
                        Към секция Тестове
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                  onClick={() => {
                    setTheoryIndex(null)
                    router.push(`/dashboard/materials/rule/${theoryIndex}`)
                  }}
                  className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 hover:bg-primary-dark transition-colors"
                >
                  Направи теста →
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
