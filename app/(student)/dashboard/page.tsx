'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { tests } from '@/data/tests'
import { lessons } from '@/data/lessons'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { fetchProgressData, type ProgressData } from '@/lib/progress'
import { getScoreColor } from '@/lib/utils'

const completedTests = tests.filter((t) => t.status === 'completed')
const completedLessons = lessons.filter((l) => l.status === 'completed')

const averageScore = completedTests.length
  ? Math.round(
      completedTests.reduce((sum, test) => sum + (test.lastScore ?? test.avgScore), 0) / completedTests.length
    )
  : 0

export default function DashboardPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const firstName = 'Ученик'

  useEffect(() => {
    fetchProgressData().then(setData).catch(() => setData(null))
  }, [])

  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
  const maxActivity = data ? Math.max(...data.weeklyActivity, 1) : 1
  const weakTopicsBySubject = data
    ? data.weakTopics.reduce<Record<string, typeof data.weakTopics>>((acc, topic) => {
        if (!acc[topic.subjectName]) acc[topic.subjectName] = []
        acc[topic.subjectName].push(topic)
        return acc
      }, {})
    : {}

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Табло" />
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary-light via-white to-primary-light/40 p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-semibold text-primary tracking-wide uppercase mb-2">MaturaHelp</p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-text">
                Здравей, {firstName}. Учи по-умно, постигай повече.
              </h1>
              <p className="text-text-muted text-sm mt-2 max-w-2xl">
                Избери една задача за следващите 20 минути и я довърши.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="badge bg-success-light text-success">Завършени тестове: {completedTests.length}</span>
                <span className="badge bg-primary-light text-primary">Завършени уроци: {completedLessons.length}</span>
                <span className="badge bg-amber-light text-amber">Среден резултат: {averageScore}%</span>
              </div>
            </div>
          </div>
        </section>

        {data ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Завършени тестове" value={data.testsCompleted} subtext="от 48 налични" />
              <StatCard label="Средна оценка" value={data.avgScore > 0 ? `${data.avgScore}%` : '—'} accent />
              <StatCard label="Завършени уроци" value={data.lessonsCompleted} subtext="от 32 налични" />
              <StatCard label="Поредни дни" value={data.streakDays} subtext="дни активност" />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div className="card p-5">
                  <h2 className="font-semibold text-text mb-4">Активност тази седмица</h2>
                  <div className="flex items-end gap-2 h-24">
                    {data.weeklyActivity.map((count, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-text-muted">{count > 0 ? count : ''}</span>
                        <div className="w-full bg-gray-100 rounded-md overflow-hidden" style={{ height: '72px' }}>
                          <div
                            className="w-full bg-primary rounded-md transition-all"
                            style={{ height: `${(count / maxActivity) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-muted">{days[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {data.scoreHistory.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-text mb-4">История на резултатите</h2>
                    <div className="space-y-3">
                      {data.scoreHistory.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-xs text-text-muted w-12 flex-shrink-0">{item.date}</span>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-text mb-1 truncate">{item.testName}</p>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${item.score >= 80 ? 'bg-success' : item.score >= 60 ? 'bg-amber' : 'bg-danger'}`}
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-sm font-bold font-serif flex-shrink-0 w-10 text-right ${getScoreColor(item.score)}`}>
                            {item.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.recentActivity.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-text mb-4">Последна активност</h2>
                    <div className="space-y-3">
                      {data.recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.type === 'test' ? 'bg-primary-light' :
                            item.type === 'lesson' ? 'bg-success-light' : 'bg-amber-light'
                          }`}>
                            {item.type === 'test' ? (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>
                            ) : item.type === 'lesson' ? (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="#16A34A"><path d="M5 3l14 9-14 9V3z"/></svg>
                            ) : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h10"/></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">{item.title}</p>
                            <p className="text-xs text-text-muted">{item.date}</p>
                          </div>
                          {item.score !== undefined && (
                            <span className={`text-sm font-bold font-serif flex-shrink-0 ${getScoreColor(item.score)}`}>
                              {item.score}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="space-y-4">
                <div className="card p-5">
                  <h2 className="font-semibold text-text mb-4 text-sm">Общ напредък</h2>
                  <div className="space-y-3">
                    <ProgressBar value={data.testsCompleted} max={data.totalTests} label="Тестове" showLabel />
                    <ProgressBar value={data.lessonsCompleted} max={data.totalLessons} label="Уроци" showLabel />
                  </div>
                </div>

                {data.weakTopics.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-text mb-3 text-sm">Теми за подобрение</h2>
                    <div className="space-y-3">
                      {data.weakTopics.map((topic) => (
                        <div key={topic.name}>
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <p className="text-xs font-medium text-text leading-snug">{topic.name}</p>
                              <p className="text-[10px] text-text-muted">{topic.subjectName}</p>
                            </div>
                            <span className={`text-xs font-bold font-serif ${getScoreColor(topic.avgScore)}`}>{topic.avgScore}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-1.5 bg-danger rounded-full" style={{ width: `${topic.avgScore}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.strongTopics.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-text mb-3 text-sm">Силни теми</h2>
                    <div className="space-y-3">
                      {data.strongTopics.map((topic) => (
                        <div key={topic.name}>
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <p className="text-xs font-medium text-text leading-snug">{topic.name}</p>
                              <p className="text-[10px] text-text-muted">{topic.subjectName}</p>
                            </div>
                            <span className={`text-xs font-bold font-serif ${getScoreColor(topic.avgScore)}`}>{topic.avgScore}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-1.5 bg-success rounded-full" style={{ width: `${topic.avgScore}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4">Често допускани грешки</h2>
              {Object.keys(weakTopicsBySubject).length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(weakTopicsBySubject).map(([subject, subjectTopics]) => (
                    <div key={subject} className="rounded-xl border border-border bg-white p-4">
                      <h3 className="text-sm font-semibold text-text mb-3">{subject}</h3>
                      <div className="space-y-2.5">
                        {subjectTopics.map((topic) => (
                          <div key={`${subject}-${topic.name}`} className="rounded-lg bg-danger-light/45 px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-text leading-snug">{topic.name}</p>
                              <span className={`text-xs font-bold ${getScoreColor(topic.avgScore)}`}>{topic.avgScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  Все още няма натрупани грешки по предмети.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="card p-8 text-center text-text-muted text-sm">Зареждане на напредък...</div>
        )}
      </div>
    </div>
  )
}
