'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { lessons, formatDuration } from '@/data/lessons'
import { tests } from '@/data/tests'
import { Badge } from '@/components/shared/Badge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LessonPage() {
  const params = useParams()
  const lesson = lessons.find((l) => l.id === params.id) || lessons[0]
  const relatedTest = lesson.relatedTestId ? tests.find((t) => t.id === lesson.relatedTestId) : null

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(lesson.progress || 0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [completed, setCompleted] = useState(lesson.status === 'completed')

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Аудио урок" />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">

            {/* Lesson header */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant={lesson.examType === 'nvo7' ? 'primary' : 'amber'}>
                  {lesson.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                </Badge>
                <Badge variant="neutral">{lesson.subjectName}</Badge>
                {lesson.isPremium && <Badge variant="amber">Премиум</Badge>}
              </div>
              <h1 className="text-xl font-serif font-bold text-text mb-1">{lesson.title}</h1>
              <p className="text-sm text-text-muted">{lesson.topicName}</p>
            </div>

            {/* Audio Player */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text text-sm">Аудио урок</h2>
                <span className="text-xs text-text-muted">{formatDuration(lesson.durationSeconds)}</span>
              </div>

              {/* Waveform placeholder */}
              <div className="bg-bg rounded-xl p-4 mb-4 flex items-center gap-1 h-16">
                {Array.from({ length: 40 }).map((_, i) => {
                  const height = [20, 40, 60, 80, 55, 35, 70, 90, 45, 30, 65, 85, 50, 25, 75][i % 15]
                  const isPlayed = (i / 40) * 100 <= progress
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-full transition-colors',
                        isPlayed ? 'bg-primary' : 'bg-border'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-text-muted mb-1.5">
                  <span>{formatDuration(Math.round(lesson.durationSeconds * progress / 100))}</span>
                  <span>{formatDuration(lesson.durationSeconds)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-gray-100 appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1B4FD8 ${progress}%, #E4E7EC ${progress}%)`
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setProgress((p) => Math.max(0, p - 10))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                    <text x="9" y="15" fontSize="7" fill="currentColor">15</text>
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setProgress((p) => Math.min(100, p + 10))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                <span className="font-semibold text-text text-sm">Транскрипт</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={cn('text-text-muted transition-transform', showTranscript && 'rotate-180')}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showTranscript && (
                <div className="px-5 pb-5 border-t border-border">
                  <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line pt-4">
                    {lesson.transcript}
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-text text-sm mb-3">Резюме на урока</h3>
              <p className="text-sm text-text-muted leading-relaxed">{lesson.summary}</p>
            </div>

            {/* Mark complete */}
            {!completed && (
              <button
                onClick={() => setCompleted(true)}
                className="w-full btn-primary py-3 justify-center"
              >
                Отбележи като завършен
              </button>
            )}
            {completed && (
              <div className="card p-4 border-success/30 bg-success-light/30 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                <p className="text-sm font-semibold text-success">Урокът е отбелязан като завършен</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="card p-5">
              <h3 className="font-semibold text-text text-sm mb-3">Твоят напредък</h3>
              <ProgressBar value={progress} showLabel label="Изслушан" />
            </div>

            {/* Related test */}
            {relatedTest && (
              <div className="card p-5">
                <h3 className="font-semibold text-text text-sm mb-3">Свързан тест</h3>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">{relatedTest.title}</p>
                <Link href={`/dashboard/tests/${relatedTest.id}`} className="btn-primary text-xs w-full justify-center">
                  Реши теста
                </Link>
              </div>
            )}

            {/* AI help */}
            <div className="card p-5 bg-primary-light border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <h3 className="font-semibold text-primary text-sm">AI помощник</h3>
              </div>
              <p className="text-xs text-primary/70 mb-3">Имаш въпрос по темата? AI-ят ще ти помогне.</p>
              <Link href="/dashboard/ai" className="btn-primary text-xs w-full justify-center">
                Питай AI
              </Link>
            </div>

            {/* Other lessons in topic */}
            <div className="card p-5">
              <h3 className="font-semibold text-text text-sm mb-3">Следващи уроци</h3>
              <div className="space-y-2.5">
                {lessons
                  .filter((l) => l.topicId === lesson.topicId && l.id !== lesson.id)
                  .slice(0, 3)
                  .map((l) => (
                    <Link
                      key={l.id}
                      href={`/dashboard/lessons/${l.id}`}
                      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#6B7280"><path d="M5 3l14 9-14 9V3z"/></svg>
                      </div>
                      <p className="text-xs text-text leading-snug">{l.title}</p>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
