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
  cancel_at_period_end: boolean | null
  cancel_at: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  last_payment_at: string | null
  last_payment_status: string | null
  updated_at: string | null
}

type AuthMeta = {
  email: string | null
  last_sign_in_at: string | null
  banned_until: string | null
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

function billingStatusVariant(status: string | null | undefined) {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'paid':
    case 'manual':
      return 'success'
    case 'past_due':
    case 'incomplete':
      return 'amber'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
    case 'manual_revoked':
      return 'danger'
    default:
      return 'neutral'
  }
}

function planLabel(key: string | null | undefined) {
  if (!key) return '—'
  if (isPlanKey(key)) return BILLING_PLANS[key].name
  return key
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string; status?: string; role?: string }>
}) {
  const params = await searchParams
  const search = (params.search ?? '').trim().toLowerCase()
  const planFilter = params.plan ?? 'all'
  const statusFilter = params.status ?? 'all'
  const roleFilter = params.role ?? 'all'

  const admin = createAdminClient()

  const { data: profilesData } = await admin
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  const profiles = (profilesData ?? []) as Profile[]

  // listUsers — paginate to cover all
  const authMap = new Map<string, AuthMeta>()
  let page = 1
  const perPage = 1000
  // Hard cap on pages to avoid runaway loops
  for (let i = 0; i < 10; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data) break
    for (const u of data.users) {
      authMap.set(u.id, {
        email: u.email ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
        banned_until: (u as { banned_until?: string | null }).banned_until ?? null,
      })
    }
    if (data.users.length < perPage) break
    page += 1
  }

  const enriched = profiles.map((p) => ({
    profile: p,
    auth: authMap.get(p.id) ?? { email: null, last_sign_in_at: null, banned_until: null },
  }))

  // Stats — computed before filtering
  const totalUsers = enriched.length
  const premiumCount = enriched.filter(
    ({ profile }) => profile.plan === 'premium' && profile.is_active === true
  ).length
  const expiredCount = enriched.filter(({ profile }) => {
    if (!profile.plan_expires_at) return false
    const exp = new Date(profile.plan_expires_at)
    return !Number.isNaN(exp.getTime()) && exp <= new Date() && profile.plan === 'premium'
  }).length
  const pastDueCount = enriched.filter(
    ({ profile }) => profile.billing_status === 'past_due'
  ).length

  const filtered = enriched.filter(({ profile, auth }) => {
    if (search) {
      const haystack = `${auth.email ?? ''} ${profile.name ?? ''}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    if (planFilter !== 'all' && profile.plan !== planFilter) return false
    if (statusFilter !== 'all' && profile.billing_status !== statusFilter) return false
    if (roleFilter !== 'all' && (profile.role ?? 'user') !== roleFilter) return false
    return true
  })

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Потребители" />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Общо потребители</p>
            <p className="text-2xl font-bold font-serif text-text">{totalUsers}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Премиум (активни)</p>
            <p className="text-2xl font-bold font-serif text-text">{premiumCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Изтекли</p>
            <p className="text-2xl font-bold font-serif text-text">{expiredCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-1">Past due</p>
            <p className="text-2xl font-bold font-serif text-text">{pastDueCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-text-muted">{filtered.length} от {totalUsers} потребители</p>
        </div>

        {/* Filters */}
        <form method="GET" className="card p-4 mb-5">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                name="search"
                defaultValue={params.search ?? ''}
                placeholder="Търси по имейл или име..."
                className="input-field pl-9"
              />
            </div>
            <select name="plan" defaultValue={planFilter} className="input-field">
              <option value="all">Всички планове</option>
              <option value="free">Безплатен</option>
              <option value="premium">Премиум</option>
            </select>
            <select name="status" defaultValue={statusFilter} className="input-field">
              <option value="all">Всички статуси</option>
              <option value="active">active</option>
              <option value="trialing">trialing</option>
              <option value="past_due">past_due</option>
              <option value="canceled">canceled</option>
              <option value="paid">paid</option>
              <option value="manual">manual</option>
              <option value="manual_revoked">manual_revoked</option>
              <option value="unpaid">unpaid</option>
              <option value="incomplete">incomplete</option>
            </select>
            <select name="role" defaultValue={roleFilter} className="input-field">
              <option value="all">Всички роли</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="btn-primary">Приложи</button>
            <Link href="/admin/users" className="btn-secondary">Изчисти</Link>
          </div>
        </form>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Имейл</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Последен вход</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">План</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Тарифа</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Изтича</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Роля</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ profile, auth }) => (
                  <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${profile.id}`} className="block">
                        <p className="text-sm font-medium text-text">{auth.email ?? '—'}</p>
                        {profile.name && (
                          <p className="text-xs text-text-muted">{profile.name}</p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {formatBgDate(auth.last_sign_in_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={profile.plan === 'premium' ? 'amber' : 'neutral'}>
                        {profile.plan === 'premium' ? 'Премиум' : 'Безплатен'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {profile.billing_status ? (
                        <Badge variant={billingStatusVariant(profile.billing_status)}>
                          {profile.billing_status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text">{planLabel(profile.billing_plan_key)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatBgDate(profile.plan_expires_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={profile.role === 'admin' ? 'primary' : 'neutral'}>
                        {profile.role ?? 'user'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <p className="font-medium">Няма намерени потребители</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
