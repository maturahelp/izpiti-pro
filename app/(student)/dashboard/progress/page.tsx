'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { fetchProgressData, type ProgressData, type ExamCategory, type ExamResult } from '@/lib/progress'
import { getScoreColor } from '@/lib/utils'
import { studentTests } from '@/data/student-content'

const EXAM_CATEGORIES: { key: ExamCategory; label: string; color: string }[] = [
  { key: 'nvo-primer',  label: 'НВО Примерен',  color: '#4f63d2' },
  { key: 'nvo-oficial', label: 'НВО Официален', color: '#1e2d5a' },
  { key: 'dzi-primer',  label: 'ДЗИ Примерен',  color: '#10b981' },
  { key: 'dzi-oficial', label: 'ДЗИ Официален', color: '#f59e0b' },
]

function ExamScoreChart({ examResults }: { examResults: ExamResult[] }) {
  if (!examResults.length) return null

  const W = 600, H = 200, PAD = { top: 16, right: 16, bottom: 32, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const allDates = [...new Set(examResults.map(r => r.date))].sort()
  const xScale = (date: string) => {
    const i = allDates.indexOf(date)
    return PAD.left + (allDates.length === 1 ? innerW / 2 : (i / (allDates.length - 1)) * innerW)
  }
  const yScale = (score: number) => PAD.top + innerH - (score / 100) * innerH

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-text mb-1">Резултати по изпити</h2>
      <p className="text-xs text-text-muted mb-4">Прогрес по вид тест във времето</p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
          {/* Y grid lines */}
          {yTicks.map(t => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yScale(t)} y2={yScale(t)} stroke="#e5e7eb" strokeWidth={1} />
              <text x={PAD.left - 6} y={yScale(t) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{t}%</text>
            </g>
          ))}
          {/* X labels */}
          {allDates.map((d, i) => (
            (allDates.length <= 8 || i % Math.ceil(allDates.length / 8) === 0) && (
              <text key={d} x={xScale(d)} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
                {d.slice(5)}
              </text>
            )
          ))}
          {/* Lines per category */}
          {EXAM_CATEGORIES.map(({ key, color }) => {
            const pts = examResults.filter(r => r.category === key).sort((a, b) => a.date.localeCompare(b.date))
            if (!pts.length) return null
            const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date)} ${yScale(p.score)}`).join(' ')
            return (
              <g key={key}>
                <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
                {pts.map(p => (
                  <circle key={p.date + p.score} cx={xScale(p.date)} cy={yScale(p.score)} r={4} fill={color} />
                ))}
              </g>
            )
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {EXAM_CATEGORIES.filter(c => examResults.some(r => r.category === c.key)).map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null)

  useEffect(() => {
    fetchProgressData().then(setData)
  }, [])

  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

  if (!data) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Напредък" />
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64 text-text-muted text-sm">Зареждане...</div>
        </div>
      </div>
    )
  }

  const maxActivity = Math.max(...data.weeklyActivity, 1)

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Напредък" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

        {/* Exam score line chart */}
        {data.examResults.length > 0 && <ExamScoreChart examResults={data.examResults} />}

        {/* Overview stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Mastery точки" value={data.masteryPoints} subtext="знания по теми" accent />
          <StatCard label="Energy точки" value={data.energyPoints} subtext="усилие и практика" />
          <StatCard label="Завършени тестове" value={data.testsCompleted} subtext={`от ${studentTests.length} налични`} />
          <StatCard label="Средна оценка" value={data.avgScore > 0 ? `${data.avgScore}%` : '—'} accent />
          <StatCard label="Овладени теми" value={data.masteredSkills} subtext={`${data.proficientSkills} стабилни`} />
          <StatCard label="Поредни дни" value={data.streakDays} subtext="дни активност" />
        </div>

        <div className="card p-5">
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Как работи напредъкът</p>
              <h2 className="text-lg font-bold text-text mb-2">Mastery показва колко стабилно знаеш темите. Energy показва колко работа си вложил.</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Mastery точките се променят според последния резултат по тема и могат да спаднат при по-слаб опит. Energy точките се трупат от решени и верни въпроси и не намаляват.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-border bg-gray-50 p-3">
                <p className="text-2xl font-bold text-success">{data.masteredSkills}</p>
                <p className="text-xs font-semibold text-text-muted">Овладени</p>
              </div>
              <div className="rounded-xl border border-border bg-gray-50 p-3">
                <p className="text-2xl font-bold text-primary">{data.proficientSkills}</p>
                <p className="text-xs font-semibold text-text-muted">Стабилни</p>
              </div>
              <div className="rounded-xl border border-border bg-gray-50 p-3">
                <p className="text-2xl font-bold text-amber">{data.familiarSkills}</p>
                <p className="text-xs font-semibold text-text-muted">Познати</p>
              </div>
              <div className="rounded-xl border border-border bg-gray-50 p-3">
                <p className="text-2xl font-bold text-text-muted">{data.attemptedSkills}</p>
                <p className="text-xs font-semibold text-text-muted">Опитани</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Weekly activity */}
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

            {/* Score history */}
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

            {/* Recent activity */}
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

            {data.recentActivity.length === 0 && data.scoreHistory.length === 0 && (
              <div className="card p-8 text-center text-text-muted text-sm">
                Все още няма активност. Реши тест или урок за да видиш прогреса си тук.
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4 text-sm">Общ напредък</h2>
              <div className="space-y-3">
                <ProgressBar value={data.masteryPoints} max={Math.max(data.totalTests * 100, 100)} label="Mastery точки" showLabel />
                <ProgressBar value={data.testsCompleted} max={data.totalTests} label="Тестове" showLabel />
                <ProgressBar value={data.lessonsCompleted} max={data.totalLessons} label="Уроци" showLabel />
              </div>
            </div>

            {data.recentEnergyEvents.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-text mb-3 text-sm">Последни Energy точки</h2>
                <div className="space-y-2">
                  {data.recentEnergyEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between gap-3 rounded-lg bg-success-light px-3 py-2">
                      <p className="text-xs font-medium text-text truncate">{event.reason}</p>
                      <span className="text-xs font-bold text-success">+{event.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
      </div>
    </div>
  )
}
