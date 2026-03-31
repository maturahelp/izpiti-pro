import { adminAnalytics } from '@/data/analytics'
import { StatCard } from '@/components/shared/StatCard'

function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text text-base">{title}</h1>
      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
        <span className="text-xs font-bold text-primary">АД</span>
      </div>
    </header>
  )
}

export default function AdminAnalyticsPage() {
  const { overview, monthlyRevenue, topTests, topLessons } = adminAnalytics

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Анализи" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Key metrics */}
        <div>
          <h2 className="font-semibold text-text mb-3">Ключови показатели</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Общо потребители" value={overview.totalUsers.toLocaleString()} trend={{ value: overview.userGrowthPercent }} />
            <StatCard label="Активни абонаменти" value={overview.activeSubscribers.toLocaleString()} accent />
            <StatCard label="Приходи (лв.)" value={overview.totalRevenue.toLocaleString()} trend={{ value: overview.revenueGrowthPercent }} />
            <StatCard label="Conversion rate" value={`${overview.conversionRate}%`} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">

          {/* Revenue chart */}
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Приходи по месеци (лв.)</h2>
            <div className="space-y-3">
              {monthlyRevenue.map((item) => {
                const pct = (item.revenue / Math.max(...monthlyRevenue.map((r) => r.revenue))) * 100
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-8">{item.month}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-text w-16 text-right font-serif">
                      {item.revenue.toLocaleString()} лв.
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Usage stats */}
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Използване на платформата</h2>
            <div className="space-y-3">
              {[
                { label: 'Решени тестове', value: overview.testsCompletedTotal, max: 60000 },
                { label: 'Изслушани уроци', value: overview.lessonsPlayedTotal, max: 60000 },
                { label: 'AI въпроси', value: overview.aiQueriesTotal, max: 60000 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="font-semibold text-text">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Средна сесия</span>
                  <span className="font-semibold text-text">{overview.avgSessionMinutes} мин.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top tests */}
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Топ тестове</h2>
            <div className="space-y-3">
              {topTests.map((test, i) => (
                <div key={test.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-text-muted flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text truncate">{test.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-primary rounded-full"
                          style={{ width: `${(test.completions / topTests[0].completions) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">{test.completions.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold font-serif text-text-muted">{test.avgScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top lessons */}
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Топ уроци</h2>
            <div className="space-y-3">
              {topLessons.map((lesson, i) => (
                <div key={lesson.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-text-muted flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text truncate">{lesson.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-success rounded-full"
                          style={{ width: `${(lesson.plays / topLessons[0].plays) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">{lesson.plays.toLocaleString()} изсл.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
