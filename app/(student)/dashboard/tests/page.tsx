'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { studentTests as tests, studentSubjects as subjects } from '@/data/student-content'
import { getDifficultyColor } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function TestsPage() {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedExam, setSelectedExam] = useState<string>('all')

  const filtered = tests.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedSubject !== 'all' && t.subjectId !== selectedSubject) return false
    if (selectedDifficulty !== 'all' && t.difficulty !== selectedDifficulty) return false
    if (selectedExam !== 'all' && t.examType !== selectedExam) return false
    return true
  })

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Тестове" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-text-muted text-sm">
            {tests.length} теста по всички предмети
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Търси тест..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input-field"
            >
              <option value="all">Всички изпити</option>
              <option value="nvo7">7. клас НВО</option>
              <option value="dzi12">12. клас ДЗИ</option>
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="all">Всички предмети</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field"
            >
              <option value="all">Всяка трудност</option>
              <option value="лесен">Лесен</option>
              <option value="среден">Среден</option>
              <option value="труден">Труден</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-text-muted mb-4">
          Намерени: <strong className="text-text">{filtered.length}</strong> теста
        </p>

        {/* Tests grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((test) => (
            <div key={test.id} className={cn('card-hover p-5 flex flex-col gap-4 relative', test.isPremium && 'premium-lock')}>
              {(test.id.startsWith('mock_') || test.id.startsWith('selected_mock_')) && (
                <div className="absolute top-3 right-3">
                  <Badge variant="neutral">Примерен</Badge>
                </div>
              )}
              {test.isPremium && <PremiumLock compact />}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant={test.examType === 'nvo7' ? 'primary' : 'amber'}>
                      {test.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                    </Badge>
                    {test.status === 'completed' && (
                      <Badge variant="success">Завършен</Badge>
                    )}
                    {test.status === 'in_progress' && (
                      <Badge variant="neutral">В процес</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-text text-sm leading-snug">{test.title}</h3>
                  <p className="text-xs text-text-muted mt-1">{test.subjectName} · {test.topicName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {test.timeMinutes} мин.
                </span>
                <span>{test.questionsCount} въпроса</span>
                <span>{test.completedCount.toLocaleString()} реш.</span>
                {test.status === 'completed' && test.lastScore && (
                  <span className={`ml-auto font-bold text-sm font-serif ${
                    test.lastScore >= 80 ? 'text-success' :
                    test.lastScore >= 60 ? 'text-amber' : 'text-danger'
                  }`}>
                    {test.lastScore}%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge text-xs ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </span>
                <Link
                  href={`/dashboard/tests/${test.id}`}
                  className={cn(
                    'text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors',
                    test.isPremium
                      ? 'bg-gray-100 text-text-muted cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  )}
                >
                  {test.status === 'completed' ? 'Повтори' : test.status === 'in_progress' ? 'Продължи' : 'Започни'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="font-medium mb-1">Няма намерени тестове</p>
            <p className="text-sm">Промени филтрите, за да видиш резултати.</p>
          </div>
        )}
      </div>
    </div>
  )
}
