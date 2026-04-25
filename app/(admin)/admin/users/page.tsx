'use client'

import { useState } from 'react'
import { adminUsers } from '@/data/users'
import { Badge } from '@/components/shared/Badge'
import { cn } from '@/lib/utils'

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

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')

  const filtered = adminUsers.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.includes(search)) return false
    if (planFilter !== 'all' && u.plan !== planFilter) return false
    if (classFilter !== 'all' && u.class !== classFilter) return false
    return true
  })

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Потребители" />
      <div className="p-6 max-w-7xl mx-auto">

        <div className="mb-5 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-[13px] text-amber-900">
          <span className="font-semibold">Preview — </span>
          Страницата показва примерни данни. CRUD операциите (добавяне, редакция, блокиране) предстоят.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-text-muted">{adminUsers.length} потребители общо</p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Търси по име или имейл..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="input-field">
              <option value="all">Всички планове</option>
              <option value="free">Безплатен</option>
              <option value="premium">Премиум</option>
            </select>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="input-field">
              <option value="all">Всички класове</option>
              <option value="7">7. клас</option>
              <option value="12">12. клас</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Потребител</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Клас</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">План</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Тестове</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Резултат</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{user.name}</p>
                          <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text">{user.class}. клас</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.plan === 'premium' ? 'amber' : 'neutral'}>
                        {user.plan === 'premium' ? 'Премиум' : 'Безплатен'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text">{user.testsCompleted}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold font-serif ${
                        user.avgScore >= 80 ? 'text-success' :
                        user.avgScore >= 60 ? 'text-amber' : 'text-danger'
                      }`}>
                        {user.avgScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'neutral'}>
                        {user.isActive ? 'Активен' : 'Неактивен'}
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
