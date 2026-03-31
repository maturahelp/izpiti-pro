import { StatCard } from '@/components/shared/StatCard'
import { adminAnalytics } from '@/data/analytics'
import { Badge } from '@/components/shared/Badge'
import Link from 'next/link'

function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">Администратор</span>
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-xs font-bold text-primary">АД</span>
        </div>
      </div>
    </header>
  )
}

export default function AdminDashboard() {
  const { overview, topTests, topLessons, recentUsers, monthlyRevenue } = adminAnalytics

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Администраторско табло" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Общо потребители" value={overview.totalUsers.toLocaleString()} trend={{ value: overview.userGrowthPercent, positive: true }} />
          <StatCard label="Активни абонаменти" value={overview.activeSubscribers.toLocaleString()} accent />
          <StatCard label="Приходи (лв.)" value={overview.totalRevenue.toLocaleString()} trend={{ value: overview.revenueGrowthPercent, positive: true }} />
          <StatCard label="Conversion rate" value={`${overview.conversionRate}%`} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Решени тестове" value={overview.testsCompletedTotal.toLocaleString()} />
          <StatCard label="Изслушани уроци" value={overview.lessonsPlayedTotal.toLocaleString()} />
          <StatCard label="AI въпроси" value={overview.aiQueriesTotal.toLocaleString()} />
          <StatCard label="Средна сесия" value={`${overview.avgSessionMinutes} мин.`} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Revenue chart */}
          <div className="lg:col-span-2 card p-5">
            <h2 className="font-semibold text-text mb-4 flex items-center justify-between">
              Приходи по месеци (лв.)
              <span className="text-xs text-text-muted font-normal">последните 6 месеца</span>
            </h2>
            <div className="flex items-end gap-3 h-32">
              {monthlyRevenue.map((item) => {
                const pct = (item.revenue / Math.max(...monthlyRevenue.map((r) => r.revenue))) * 100
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-muted">{item.revenue.toLocaleString()}</span>
                    <div className="w-full bg-gray-100 rounded-t-md overflow-hidden" style={{ height: '96px' }}>
                      <div
                        className="w-full bg-primary rounded-t-md mt-auto"
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* User distribution */}
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Потребители по клас</h2>
            <div className="space-y-3">
              {adminAnalytics.usersByClass.map((item) => (
                <div key={item.class}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-text">{item.class}</span>
                    <span className="text-text-muted">{item.count.toLocaleString()} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-primary rounded-full" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Безплатни потребители</span>
                <span className="font-semibold text-text">3 638</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Премиум абонати</span>
                <span className="font-semibold text-primary">1 234</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Top tests */}
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Най-популярни тестове</h2>
            <div className="space-y-3">
              {topTests.map((test, i) => (
                <div key={test.name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-text-muted flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text truncate">{test.name}</p>
                    <p className="text-[10px] text-text-muted">{test.completions.toLocaleString()} решения · {test.avgScore}% средно</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent users */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text text-sm">Нови потребители</h2>
              <Link href="/admin/users" className="text-xs text-primary hover:underline">Всички</Link>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.email} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text">{user.name}</p>
                    <p className="text-[10px] text-text-muted">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.plan === 'premium' ? 'amber' : 'neutral'}>
                      {user.plan === 'premium' ? 'Премиум' : 'Безплатен'}
                    </Badge>
                    <p className="text-[10px] text-text-muted mt-0.5">{user.joinedAt}</p>
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
