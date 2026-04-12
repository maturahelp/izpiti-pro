'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'

import { literatureThemeOrder, literatureWorks } from '@/data/literatureWorks'
import { nvoLiteratureThemeOrder, nvoLiteratureWorks } from '@/data/nvoLiteratureWorks'
import { bulgarianRuleSections } from '@/data/bulgarianRules'
import { belTheory } from '@/data/bel-theory'
import topicsData from '@/data/bel_curriculum_topics_content.json'
import { cn } from '@/lib/utils'

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


type MaterialSection = 'bulgarian' | 'literature' | 'math' | 'english'
type GradeLevel = '7' | '12'

interface CurriculumTopic {
  number: number
  title: string
  definition: string
  key_points: string[]
  exercises: unknown[]
}

const belCurriculumTopics = topicsData.topics as CurriculumTopic[]

const sectionLabels: Record<MaterialSection, string> = {
  bulgarian: 'Български език',
  literature: 'Литература',
  math: 'Математика',
  english: 'Английски',
}

const grade12OnlySections: MaterialSection[] = ['english']
const grade7OnlySections: MaterialSection[] = ['math']

const hiddenBulgarianRulesByIndex: Record<string, number[]> = {
  'ПРАВОПИСНА НОРМА': [11, 18, 20], // 12, 19, 21 (1-based)
}


export default function MaterialsPage() {
  const router = useRouter()
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('12')
  const [selectedSection, setSelectedSection] = useState<MaterialSection>('bulgarian')
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)
  const [activeNvoWorkId, setActiveNvoWorkId] = useState<string | null>(null)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const [activeTextWorkId, setActiveTextWorkId] = useState<string | null>(null)
  const [activeTextContent, setActiveTextContent] = useState('')
  const [textLoading, setTextLoading] = useState(false)
  const [textError, setTextError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRuleKey, setExpandedRuleKey] = useState<string | null>(null)
  const [theoryIndex, setTheoryIndex] = useState<number | null>(null)

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const literatureGroups = literatureThemeOrder
    .map((theme) => ({
      theme,
      works: literatureWorks.filter((work) => {
        if (work.theme !== theme) return false
        if (selectedGrade !== '12') return false
        if (!normalizedQuery) return true
        const searchableText = `${work.title} ${work.author} ${work.theme}`.toLowerCase()
        return searchableText.includes(normalizedQuery)
      }),
    }))
    .filter((group) => group.works.length > 0)

  const filteredLiteratureCount = literatureGroups.reduce((acc, group) => acc + group.works.length, 0)

  const nvoLiteratureGroups = nvoLiteratureThemeOrder
    .map((theme) => ({
      theme,
      works: nvoLiteratureWorks.filter((work) => {
        if (work.theme !== theme) return false
        if (!normalizedQuery) return true
        const searchableText = `${work.title} ${work.author} ${work.theme}`.toLowerCase()
        return searchableText.includes(normalizedQuery)
      }),
    }))
    .filter((group) => group.works.length > 0)

  const filteredNvoLiteratureCount = nvoLiteratureGroups.reduce((acc, group) => acc + group.works.length, 0)

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

  const bulgarianRulesCount = selectedGrade === '12'
    ? bulgarianRuleGroups.reduce((acc, section) => acc + section.items.length, 0)
    : 0

  const filteredBelCurriculumTopics = belCurriculumTopics
    .map((topic, topicIndex) => ({ topic, topicIndex }))
    .filter(({ topic }) => {
      if (selectedGrade !== '7') return false
      if (!normalizedQuery) return true

      const searchableText = [
        topic.title,
        topic.definition,
        ...topic.key_points,
      ].join(' ').toLowerCase()

      return searchableText.includes(normalizedQuery)
    })

  const activeWork = literatureWorks.find((work) => work.id === activeWorkId)
  const activeNvoWork = nvoLiteratureWorks.find((work) => work.id === activeNvoWorkId)
  const activeTextWork = activeTextWorkId ? literatureWorks.find((w) => w.id === activeTextWorkId) : null

  const openTextForWork = async (workId: string) => {
    setActiveTextWorkId(workId)
    setTextLoading(true)
    setTextError(null)
    setActiveTextContent('')
    try {
      const response = await fetch(`/dzi-texts/${workId}.txt`)
      if (!response.ok) throw new Error('Неуспешно зареждане')
      const text = await response.text()
      setActiveTextContent(text.trim())
    } catch {
      setTextError('Текстът не може да бъде зареден в момента.')
    } finally {
      setTextLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Материали" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        <div className="mb-3 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-white p-1">
            {([
              { value: '7', label: '7. клас' },
              { value: '12', label: '12. клас' },
            ] as const).map((grade) => (
              <button
                key={grade.value}
                type="button"
                onClick={() => {
                  setSelectedGrade(grade.value)
                  if (grade.value === '7' && grade12OnlySections.includes(selectedSection)) {
                    setSelectedSection('bulgarian')
                  }
                  if (grade.value === '12' && grade7OnlySections.includes(selectedSection)) {
                    setSelectedSection('bulgarian')
                  }
                }}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  selectedGrade === grade.value
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {grade.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="hidden md:block" />

          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(sectionLabels) as MaterialSection[])
              .filter((section) => !grade12OnlySections.includes(section) || selectedGrade === '12')
              .filter((section) => !grade7OnlySections.includes(section) || selectedGrade === '7')
              .map((section) => {
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
              Намерени:{' '}
              <strong className="text-text">
                {selectedGrade === '7' ? filteredNvoLiteratureCount : filteredLiteratureCount}
              </strong>{' '}
              творби
            </p>

            <div className="space-y-6">
              {selectedGrade === '7' && nvoLiteratureGroups.map(({ theme, works }) => (
                <section key={theme}>
                  <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-3">
                    {theme}
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
                          src={work.image}
                          alt={work.title}
                          className="w-full h-auto object-contain rounded-lg border border-border"
                        />
                        <p className="mt-3 text-xs font-semibold text-primary">Отвори произведението</p>
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              {selectedGrade === '12' && literatureGroups.map(({ theme, works }, themeIndex) => (
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
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              {selectedGrade === '7' && filteredNvoLiteratureCount === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени произведения</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}

              {selectedGrade === '12' && filteredLiteratureCount === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени произведения</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedSection === 'math' && selectedGrade === '7' ? (
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
            <section>
              <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-1">
                Материали 7 клас
              </h3>
              <p className="text-xs text-text-muted text-center mb-4">Математика</p>

              <div className="text-center py-10 text-text-muted">
                <p className="font-medium mb-1">Материалите по математика са активни</p>
                <p className="text-sm">Използвай секция „Тестове“ за НВО по математика и примерни изпити.</p>
              </div>
            </section>
          </div>
        ) : selectedSection === 'bulgarian' ? (
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
            <p className="text-sm text-text-muted mb-4">
              Намерени:{' '}
              <strong className="text-text">
                {selectedGrade === '7' ? filteredBelCurriculumTopics.length : bulgarianRulesCount}
              </strong>{' '}
              {selectedGrade === '7' ? 'учебни теми' : 'правила и термини'}
            </p>

            <div className="space-y-6">
              {selectedGrade === '7' && (
                <>
                  {filteredBelCurriculumTopics.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBelCurriculumTopics.map(({ topic, topicIndex }) => (
                        <button
                          key={topic.number}
                          type="button"
                          onClick={() => router.push(`/dashboard/materials/curriculum-topic/${topicIndex}`)}
                          className="card p-4 text-left transition-transform duration-200 hover:-translate-y-0.5"
                        >
                          <p className="text-xs font-semibold text-primary mb-1">
                            Учебна тема #{topic.number}
                          </p>
                          <h3 className="font-semibold text-text text-sm leading-snug mb-3">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">
                            {topic.definition}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#1E4D7B]">
                            <span className="rounded-full bg-[#D7E7F7] px-2.5 py-1">
                              {topic.key_points.length} ключови точки
                            </span>
                            <span className="rounded-full bg-[#D7E7F7] px-2.5 py-1">
                              {topic.exercises.length} въпроса
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-text-muted">
                      <p className="font-medium mb-1">Няма намерени учебни теми</p>
                      <p className="text-sm">Опитай с друга ключова дума.</p>
                    </div>
                  )}
                </>
              )}

              {selectedGrade === '12' && bulgarianRuleGroups.map((section, sectionIndex) => (
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

              {selectedGrade === '12' && bulgarianRulesCount === 0 && (
                <div className="text-center py-10 text-text-muted">
                  <p className="font-medium mb-1">Няма намерени правила</p>
                  <p className="text-sm">Опитай с друга ключова дума.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedSection === 'english' && selectedGrade === '12' ? (
          <div className="rounded-2xl border border-[#D7E7F7] bg-[#F2F8FF] p-4 md:p-5">
            <section>
              <h3 className="text-sm md:text-base font-semibold text-[#1E4D7B] text-center mb-1">
                Материали 12 клас
              </h3>
              <p className="text-xs text-text-muted text-center mb-4">Английски език</p>

              <div className="text-center py-10 text-text-muted">
                <p className="font-medium mb-1">Няма добавени материали</p>
                <p className="text-sm">ДЗИ тестовете по английски са преместени в секция „Тестове“.</p>
              </div>
            </section>
          </div>
        ) : null}
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

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0">
              <div className="p-4 md:p-6 bg-[#F8FBFF] border-b lg:border-b-0 lg:border-r border-border">
                <img
                  src={activeNvoWork.image}
                  alt={activeNvoWork.title}
                  className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-white"
                />
              </div>

              <div className="p-4 md:p-6 flex flex-col justify-center gap-3">
                <button className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.5 8.5a5 5 0 010 7" />
                    <path d="M18.5 5.5a9 9 0 010 13" />
                  </svg>
                  <span>Слушай аудио урока</span>
                </button>

                {activeNvoWork.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoUrl(activeNvoWork.videoUrl!)}
                    className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-[#1E4D7B] text-white hover:bg-[#163b5f] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <polygon points="10 8 17 12 10 16 10 8" fill="currentColor" stroke="none" />
                    </svg>
                    <span>Гледай видео урока</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveNvoWorkId(null)
                    router.push(`/dashboard/literature-exercise/${activeNvoWork.id}`)
                  }}
                  className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-amber text-white hover:bg-amber/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                    <path d="M8 16l2 2 4-4" />
                  </svg>
                  <span>Направи упражнението</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-black overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#1E4D7B]">
              <span className="text-sm font-semibold text-white">Видео урок</span>
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                aria-label="Затвори"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={activeVideoUrl}
              src={activeVideoUrl}
              controls
              autoPlay
              className="w-full aspect-video bg-black"
            />
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

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0">
              <div className="p-4 md:p-6 bg-[#F8FBFF] border-b lg:border-b-0 lg:border-r border-border">
                <img
                  src={encodeURI(activeWork.image)}
                  alt={activeWork.title}
                  className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-white"
                />
              </div>

              <div className="p-4 md:p-6 flex flex-col justify-center gap-3">
                <button className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.5 8.5a5 5 0 010 7" />
                    <path d="M18.5 5.5a9 9 0 010 13" />
                  </svg>
                  <span>Слушай аудио урока</span>
                </button>
                <button className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-[#1E4D7B] text-white hover:bg-[#163b5f] transition-colors inline-flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <polygon points="10 8 17 12 10 16 10 8" fill="currentColor" stroke="none" />
                  </svg>
                  <span>Гледай видео урока</span>
                </button>
                <button className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-amber text-white hover:bg-amber/90 transition-colors inline-flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                    <path d="M8 16l2 2 4-4" />
                  </svg>
                  <span>Направи упражнението</span>
                </button>
                {selectedGrade === '12' && (
                  <button
                    type="button"
                    onClick={() => openTextForWork(activeWork.id)}
                    className="w-full rounded-xl py-3 px-4 text-sm font-semibold bg-white text-primary border border-primary/30 hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Прочети текста</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTextWorkId && activeTextWork && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
          onClick={() => {
            setActiveTextWorkId(null)
            setActiveTextContent('')
            setTextError(null)
          }}
        >
          <div
            className="w-full max-w-6xl h-[86vh] rounded-2xl bg-white border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">12. клас · Текст</p>
                <h3 className="text-base md:text-lg font-bold text-text">{activeTextWork.title}</h3>
                <p className="text-xs text-text-muted mt-1">{activeTextWork.author}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTextWorkId(null)
                  setActiveTextContent('')
                  setTextError(null)
                }}
                className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Затвори"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-[calc(86vh-73px)] overflow-y-auto bg-[#F8FBFF] p-5 md:p-6">
              {textLoading && (
                <p className="text-sm text-text-muted">Зареждане на текста...</p>
              )}
              {!textLoading && textError && (
                <p className="text-sm text-danger">{textError}</p>
              )}
              {!textLoading && !textError && activeTextContent && (
                <pre className="whitespace-pre-wrap break-words text-[15px] leading-7 text-text font-sans">
                  {activeTextContent}
                </pre>
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
