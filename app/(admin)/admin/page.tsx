import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/shared/Badge'
import { BILLING_PLANS, isPlanKey } from '@/lib/billing/plans'

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

type Profile = {
  id: string
  name: string | null
  role: string | null
  plan: string | null
  is_active: boolean | null
  plan_expires_at: string | null
  class: string | null
  exam_path: string | null
  billing_plan_key: string | null
  billing_status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  updated_at: string | null
}

type AuthMeta = {
  email: string | null
  created_at: string | null
  last_sign_in_at: string | null
}

function formatBgDate(value: string | null | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function planLabel(key: string | null | undefined) {
  if (!key) return '—'
  if (isPlanKey(key)) return BILLING_PLANS[key].name
  return key
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const admin = createAdminClient()

  const { data: profilesData } = await admin
    .from('profiles')
    .select('id,name,role,plan,is_active,plan_expires_at,class,exam_path,billing_plan_key,billing_status,current_period_end,cancel_at_period_end,updated_at')
    .order('updated_at', { ascending: false })

  const profiles = (profilesData ?? []) as Profile[]

  const authMap = new Map<string, AuthMeta>()
  let page = 1
  const perPage = 1000
  for (let i = 0; i < 10; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data) break
    for (const u of data.users) {
      authMap.set(u.id, {
        email: u.email ?? null,
        created_at: u.created_at ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
      })
    }
    if (data.users.length < perPage) break
    page += 1
  }

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const totalUsers = profiles.length

  const premiumActive = profiles.filter(
    (p) => p.plan === 'premium' && p.is_active === true,
  ).length

  const expired = profiles.filter((p) => {
    if (p.plan !== 'premium' || !p.plan_expires_at) return false
    const t = new Date(p.plan_expires_at).getTime()
    return !Number.isNaN(t) && t <= now
  }).length

  const pastDue = profiles.filter((p) => p.billing_status === 'past_due').length

  const cancelingSoon = profiles.filter(
    (p) => p.cancel_at_period_end === true && p.is_active === true,
  ).length

  let new7d = 0
  let new30d = 0
  for (const meta of authMap.values()) {
    if (!meta.created_at) continue
    const t = new Date(meta.created_at).getTime()
    if (Number.isNaN(t)) continue
    const age = now - t
    if (age <= 7 * day) new7d += 1
    if (age <= 30 * day) new30d += 1
  }

  // Breakdown by class
  const classCounts = new Map<string, number>()
  for (const p of profiles) {
    const key = p.class ?? '—'
    classCounts.set(key, (classCounts.get(key) ?? 0) + 1)
  }
  const classRows = Array.from(classCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cls, count]) => ({
      cls,
      count,
      percent: totalUsers ? Math.round((count / totalUsers) * 1000) / 10 : 0,
    }))

  // Breakdown by billing plan key (only premium)
  const planCounts = new Map<string, number>()
  for (const p of profiles) {
    if (p.plan !== 'premium' || p.is_active !== true) continue
    const key = p.billing_plan_key ?? '—'
    planCounts.set(key, (planCounts.get(key) ?? 0) + 1)
  }
  const planRows = Array.from(planCounts.entries()).sort((a, b) => b[1] - a[1])

  // Recent signups (top 8 by auth.created_at)
  const recent = Array.from(authMap.entries())
    .map(([id, meta]) => {
      const profile = profiles.find((p) => p.id === id) ?? null
      return { id, meta, profile }
    })
    .filter((r) => r.meta.created_at)
    .sort((a, b) => {
      const ta = new Date(a.meta.created_at!).getTime()
      const tb = new Date(b.meta.created_at!).getTime()
      return tb - ta
    })
    .slice(0, 8)

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Табло" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Общо потребители</p>
            <p className="text-2xl font-bold font-serif text-text">{totalUsers}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Премиум (активни)</p>
            <p className="text-2xl font-bold font-serif text-primary">{premiumActive}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Нови (7 дни)</p>
            <p className="text-2xl font-bold font-serif text-text">{new7d}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Нови (30 дни)</p>
            <p className="text-2xl font-bold font-serif text-text">{new30d}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Изтекли премиуми</p>
            <p className="text-2xl font-bold font-serif text-text">{expired}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Past due</p>
            <p className="text-2xl font-bold font-serif text-text">{pastDue}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Отказват в края на периода</p>
            <p className="text-2xl font-bold font-serif text-text">{cancelingSoon}</p>
          </div>
          <div className="card p-4 flex flex-col justify-between">
            <p className="text-xs text-text-muted mb-1">Преглед</p>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">
              Виж всички потребители →
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Потребители по клас</h2>
            {classRows.length === 0 ? (
              <p className="text-sm text-text-muted">Няма данни.</p>
            ) : (
              <div className="space-y-3">
                {classRows.map((row) => (
                  <div key={row.cls}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-text">{row.cls === '—' ? 'Без клас' : row.cls}</span>
                      <span className="text-text-muted">{row.count} ({row.percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-text mb-4 text-sm">Активни тарифи</h2>
            {planRows.length === 0 ? (
              <p className="text-sm text-text-muted">Няма активни премиум абонати.</p>
            ) : (
              <div className="space-y-2">
                {planRows.map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-text">{planLabel(key)}</span>
                    <span className="text-sm font-semibold text-text">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text text-sm">Последно регистрирани</h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">Всички</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Имейл</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Регистриран</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Клас</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">План</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(({ id, meta, profile }) => (
                  <tr key={id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/users/${id}`} className="text-sm font-medium text-text hover:underline">
                        {meta.email ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-text-muted">{formatBgDate(meta.created_at)}</td>
                    <td className="px-4 py-2.5 text-sm text-text">{profile?.class ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={profile?.plan === 'premium' ? 'amber' : 'neutral'}>
                        {profile?.plan === 'premium' ? 'Премиум' : 'Безплатен'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-text-muted text-sm">Няма данни.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
