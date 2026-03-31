import { subscriptionStats } from '@/data/analytics'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/shared/Badge'

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

export default function AdminSubscriptionsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar title="Абонаменти" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Активни абонати" value={subscriptionStats.activePremium.toLocaleString()} accent />
          <StatCard label="Безплатни" value={subscriptionStats.freeUsers.toLocaleString()} />
          <StatCard label="Churn rate" value={`${subscriptionStats.monthlyChurn}%`} />
          <StatCard label="ARPU (лв.)" value={subscriptionStats.avgRevenuePerUser} />
        </div>

        {/* Plans */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Разпределение по планове</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {subscriptionStats.plans.map((plan) => (
              <div key={plan.name} className="bg-bg rounded-xl p-4">
                <p className="font-semibold text-text mb-1">{plan.name}</p>
                <p className="text-2xl font-bold font-serif text-text mb-0.5">{plan.subscribers}</p>
                <p className="text-xs text-text-muted">абоната · {plan.price} лв./период</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent subscriptions */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-text text-sm">Последни абонаменти</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Потребител</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">План</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Сума</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Дата</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionStats.recentSubscriptions.map((sub, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text">{sub.user}</td>
                    <td className="px-4 py-3 text-sm text-text">{sub.plan}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-text font-serif">{sub.amount} лв.</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{sub.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sub.status === 'active' ? 'success' : 'danger'}>
                        {sub.status === 'active' ? 'Активен' : 'Отказан'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
