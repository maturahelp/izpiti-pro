'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { lessons } from '@/data/lessons'
import { formatDuration } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type LessonSection = 'bulgarian' | 'literature' | 'math' | 'english'

const sectionLabels: Record<LessonSection, string> = {
  bulgarian: 'Български',
  literature: 'Литература',
  math: 'Математика',
  english: 'Английски',
}

const literatureKeywords = [
  'литература',
  'интерпретативно',
  'роман',
  'поема',
  'стих',
  'под игото',
  'художествен',
]

function getLessonSection(lesson: (typeof lessons)[number]): LessonSection {
  if (lesson.subjectId.startsWith('math-')) return 'math'
  if (lesson.subjectId.startsWith('eng-') || lesson.subjectName.toLowerCase().includes('англий')) return 'english'

  const searchable = `${lesson.title} ${lesson.topicName} ${lesson.subjectName}`.toLowerCase()
  const isLiterature = literatureKeywords.some((keyword) => searchable.includes(keyword))
  if (isLiterature) return 'literature'

  return 'bulgarian'
}

export default function LessonsPage() {
  const [selectedSection, setSelectedSection] = useState<LessonSection>('bulgarian')

  const filtered = lessons.filter((l) => {
    if (getLessonSection(l) !== selectedSection) return false
    return true
  })

  const statusLabel: Record<string, string> = {
    completed: 'Завършен',
    in_progress: 'В процес',
    available: 'Наличен',
    locked: 'Заключен',
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Аудио уроци" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        {/* Filters */}
        <div className="mb-6 -mt-4">
          <div className="flex flex-wrap justify-center gap-3">
            {(Object.keys(sectionLabels) as LessonSection[]).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setSelectedSection(section)}
                className={cn(
                  'inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors',
                  selectedSection === section
                    ? 'bg-primary text-white'
                    : 'bg-primary-light text-primary hover:bg-primary-light/70'
                )}
              >
                {sectionLabels[section]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Намерени: <strong className="text-text">{filtered.length}</strong> урока
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((lesson) => (
            <div key={lesson.id} className={cn(
              'card-hover p-5 flex flex-col gap-4',
              lesson.status === 'locked' && 'opacity-70'
            )}>
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  lesson.status === 'completed' ? 'bg-success-light' :
                  lesson.status === 'in_progress' ? 'bg-primary-light' :
                  lesson.status === 'locked' ? 'bg-gray-100' : 'bg-gray-100'
                )}>
                  {lesson.status === 'locked' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  ) : lesson.status === 'completed' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={lesson.status === 'in_progress' ? '#2B6CB0' : '#6B7280'}>
                      <path d="M5 3l14 9-14 9V3z"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={lesson.examType === 'nvo7' ? 'primary' : 'amber'}>
                      {lesson.examType === 'nvo7' ? 'НВО' : 'ДЗИ'}
                    </Badge>
                    {lesson.isPremium && (
                      <Badge variant="amber">Премиум</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-text text-sm leading-snug">{lesson.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{lesson.subjectName} · {lesson.topicName}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{lesson.description}</p>

              {/* Progress */}
              {lesson.status === 'in_progress' && lesson.progress !== undefined && (
                <ProgressBar value={lesson.progress} size="sm" />
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {formatDuration(lesson.durationSeconds)}
                </span>
                <Link
                  href={`/dashboard/lessons/${lesson.id}`}
                  className={cn(
                    'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
                    lesson.status === 'locked'
                      ? 'bg-gray-100 text-text-muted cursor-not-allowed'
                      : lesson.status === 'completed'
                      ? 'bg-success-light text-success hover:bg-success/20'
                      : lesson.status === 'in_progress'
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  )}
                >
                  {lesson.status === 'completed' ? 'Повтори' :
                   lesson.status === 'in_progress' ? 'Продължи' :
                   lesson.status === 'locked' ? 'Заключен' : 'Слушай'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
