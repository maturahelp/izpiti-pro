'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { tests } from '@/data/tests'
import { lessons } from '@/data/lessons'
import Link from 'next/link'
import { getDifficultyColor } from '@/lib/utils'
import { getStoredUser } from '@/lib/auth'

const recommendedTests = tests.filter((t) => !t.status || t.status === 'not_started').slice(0, 3)
const continueLessons = lessons.filter((l) => l.status === 'in_progress').slice(0, 2)

export default function DashboardPage() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setUserName(getStoredUser() || '')
  }, [])

  const firstName = userName.split(' ')[0] || 'Ученик'

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Табло" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text">
              Добре дошъл, {firstName}!
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Готов ли си за днешната подготовка?
            </p>
          </div>
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-light border border-amber/20 rounded-lg text-amber text-sm font-semibold hover:bg-amber/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Надгради до Премиум
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Завършени тестове" value={0} subtext={`от ${tests.length} на платформата`} />
          <StatCard label="Завършени уроци" value={0} subtext={`от ${lessons.length} налични`} />
          <StatCard label="Среден резултат" value="0%" subtext="от всички тестове" accent />
          <StatCard label="Поредни дни" value={0} subtext="дни активност" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {continueLessons.length > 0 && (
              <div>
                <h2 className="font-semibold text-text mb-3 flex items-center justify-between">
                  Продължи урока
                  <Link href="/dashboard/lessons" className="text-xs text-primary hover:underline font-medium">
                    Всички уроци
                  </Link>
                </h2>
                <div className="space-y-3">
                  {continueLessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/lessons/${lesson.id}`}
                      className="card-hover p-4 flex items-center gap-4 group block"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text text-sm truncate mb-1">{lesson.title}</p>
                        <ProgressBar value={lesson.progress || 0} size="sm" />
                      </div>
                      <span className="text-xs text-text-muted flex-shrink-0">{lesson.progress}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended tests */}
            <div>
              <h2 className="font-semibold text-text mb-3 flex items-center justify-between">
                Препоръчани тестове
                <Link href="/dashboard/tests" className="text-xs text-primary hover:underline font-medium">
                  Всички тестове
                </Link>
              </h2>
              <div className="space-y-3">
                {recommendedTests.map((test) => (
                  <Link
                    key={test.id}
                    href={`/dashboard/tests/${test.id}`}
                    className="card-hover p-4 flex items-center gap-3 group block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text text-sm truncate mb-1">{test.title}</p>
                      <p className="text-xs text-text-muted">{test.subjectName} · {test.questionsCount} въпроса · {test.timeMinutes} мин.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4 text-sm">Напредък по предмети</h2>
              <div className="space-y-3">
                <ProgressBar value={0} max={tests.length} label="Тестове" showLabel />
                <ProgressBar value={0} max={lessons.length} label="Уроци" showLabel />
              </div>
              <Link href="/dashboard/progress" className="block mt-4 text-center text-xs text-primary hover:underline font-medium">
                Виж пълния напредък
              </Link>
            </div>

            <div className="card p-5 border-amber/30 bg-amber-light/30">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-xs font-bold text-amber">Премиум</span>
              </div>
              <p className="text-sm font-semibold text-text mb-1">Отключи пълния достъп</p>
              <p className="text-xs text-text-muted mb-3">500+ теста, 200+ уроци, AI без ограничение</p>
              <Link href="/dashboard/subscription" className="btn-primary text-xs w-full justify-center">
                Виж плановете
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
