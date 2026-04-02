'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { tests } from '@/data/tests'
import { getDifficultyColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

const mockExams = tests.filter(
  (t) => t.id.startsWith('mock_') || t.id.startsWith('selected_mock_'),
)
const nvoMocks = mockExams.filter((t) => t.examType === 'nvo7')
const dziMocks = mockExams.filter((t) => t.examType === 'dzi12')

export default function PracticePage() {
  const [tab, setTab] = useState<'nvo' | 'dzi'>('nvo')
  const activeExams = tab === 'nvo' ? nvoMocks : dziMocks

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Примерни изпити" />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">

        {/* Intro */}
        <div className="mb-6">
          <p className="text-text-muted text-sm max-w-xl">
            Пълни примерни изпити по формата на реалните НВО и ДЗИ.
            Всеки включва изходен текст, инфографика, тестови и свободни въпроси с ключ за отговори.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex bg-white border border-border rounded-xl p-1 mb-6 gap-1">
          <button
            onClick={() => setTab('nvo')}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'nvo'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text',
            )}
          >
            НВО 7. клас
            <span
              className={cn(
                'ml-2 text-xs px-1.5 py-0.5 rounded-full',
                tab === 'nvo' ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted',
              )}
            >
              {nvoMocks.length}
            </span>
          </button>
          <button
            onClick={() => setTab('dzi')}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'dzi'
                ? 'bg-amber text-white shadow-sm'
                : 'text-text-muted hover:text-text',
            )}
          >
            ДЗИ 12. клас
            <span
              className={cn(
                'ml-2 text-xs px-1.5 py-0.5 rounded-full',
                tab === 'dzi' ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted',
              )}
            >
              {dziMocks.length}
            </span>
          </button>
        </div>

        {/* Exam grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {activeExams.map((exam) => (
            <div key={exam.id} className="card-hover p-5 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={exam.examType === 'nvo7' ? 'primary' : 'amber'}>
                    {exam.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                  </Badge>
                  <Badge variant="neutral">Примерен</Badge>
                  {exam.status === 'completed' && <Badge variant="success">Завършен</Badge>}
                  {exam.status === 'in_progress' && <Badge variant="neutral">В процес</Badge>}
                </div>
                <h3 className="font-semibold text-text text-sm leading-snug">{exam.title}</h3>
                <p className="text-xs text-text-muted mt-1">
                  {exam.subjectName} · {exam.topicName}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {exam.timeMinutes} мин.
                </span>
                <span>{exam.questionsCount} въпроса</span>
                {exam.status === 'completed' && exam.lastScore != null && (
                  <span
                    className={`ml-auto font-bold text-sm font-serif ${
                      exam.lastScore >= 80
                        ? 'text-success'
                        : exam.lastScore >= 60
                          ? 'text-amber'
                          : 'text-danger'
                    }`}
                  >
                    {exam.lastScore}%
                  </span>
                )}
                {(exam.status !== 'completed' || exam.lastScore == null) && (
                  <span className={`badge text-xs ml-auto ${getDifficultyColor(exam.difficulty)}`}>
                    {exam.difficulty}
                  </span>
                )}
              </div>

              <Link
                href={`/dashboard/tests/${exam.id}`}
                className="btn-primary text-sm text-center"
              >
                {exam.status === 'completed'
                  ? 'Повтори'
                  : exam.status === 'in_progress'
                    ? 'Продължи'
                    : 'Започни'}
              </Link>
            </div>
          ))}
        </div>

        {activeExams.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="font-medium mb-1">Няма примерни изпити</p>
            <p className="text-sm">Провери отново по-късно.</p>
          </div>
        )}
      </div>
    </div>
  )
}
