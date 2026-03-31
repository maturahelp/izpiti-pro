import { TopBar } from '@/components/dashboard/TopBar'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Badge } from '@/components/shared/Badge'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { currentUser, progressData } from '@/data/users'
import { tests } from '@/data/tests'
import { lessons } from '@/data/lessons'
import Link from 'next/link'
import { getDifficultyColor } from '@/lib/utils'

const recentTests = tests.filter((t) => t.status === 'completed').slice(0, 3)
const continueLessons = lessons.filter((l) => l.status === 'in_progress').slice(0, 2)
const recommendedTests = tests.filter((t) => t.status === 'not_started' && !t.isPremium).slice(0, 3)

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Табло" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text">
              Добре дошла, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              {currentUser.examPath} · {currentUser.streakDays} поредни дни активност
            </p>
          </div>
          {currentUser.plan === 'free' && (
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-light border border-amber/20 rounded-lg text-amber text-sm font-semibold hover:bg-amber/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Надгради до Премиум
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Завършени тестове"
            value={progressData.testsCompleted}
            subtext={`от ${progressData.totalTests} на платформата`}
          />
          <StatCard
            label="Завършени уроци"
            value={progressData.lessonsCompleted}
            subtext={`от ${progressData.totalLessons} налични`}
          />
          <StatCard
            label="Среден резултат"
            value={`${progressData.avgScore}%`}
            subtext="от всички тестове"
            accent
          />
          <StatCard
            label="Поредни дни"
            value={progressData.streakDays}
            subtext="дни активност"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Continue Learning */}
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
            {/* Progress overview */}
            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4 text-sm">Напредък по предмети</h2>
              <div className="space-y-3">
                <ProgressBar
                  value={progressData.testsCompleted}
                  max={progressData.totalTests}
                  label="Тестове"
                  showLabel
                />
                <ProgressBar
                  value={progressData.lessonsCompleted}
                  max={progressData.totalLessons}
                  label="Уроци"
                  showLabel
                />
              </div>
              <Link href="/dashboard/progress" className="block mt-4 text-center text-xs text-primary hover:underline font-medium">
                Виж пълния напредък
              </Link>
            </div>

            {/* Recent activity */}
            <div className="card p-5">
              <h2 className="font-semibold text-text mb-3 text-sm">Последна активност</h2>
              <div className="space-y-3">
                {progressData.recentActivity.slice(0, 4).map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'test' ? 'bg-primary-light' :
                      activity.type === 'lesson' ? 'bg-success-light' : 'bg-amber-light'
                    }`}>
                      {activity.type === 'test' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2.5">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        </svg>
                      ) : activity.type === 'lesson' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#16A34A">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text truncate">{activity.title}</p>
                      <p className="text-[10px] text-text-muted">
                        {activity.date}
                        {'score' in activity && ` · ${activity.score}%`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium upsell for free users */}
            {currentUser.plan === 'free' && (
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
            )}
          </div>
        </div>

        {/* Recent test results */}
        {recentTests.length > 0 && (
          <div>
            <h2 className="font-semibold text-text mb-3">Последни резултати</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {recentTests.map((test) => (
                <div key={test.id} className="card p-4">
                  <p className="text-xs text-text-muted mb-1">{test.subjectName}</p>
                  <p className="text-sm font-semibold text-text mb-2 leading-snug">{test.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold font-serif ${
                      (test.lastScore || 0) >= 80 ? 'text-success' :
                      (test.lastScore || 0) >= 60 ? 'text-amber' : 'text-danger'
                    }`}>
                      {test.lastScore}%
                    </span>
                    <Link href={`/dashboard/tests/${test.id}`} className="text-xs text-primary hover:underline">
                      Повтори
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
