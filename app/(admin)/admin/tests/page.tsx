'use client'

import { useState } from 'react'
import { tests } from '@/data/tests'
import { Badge } from '@/components/shared/Badge'
import { getDifficultyColor } from '@/lib/utils'

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

export default function AdminTestsPage() {
  const [search, setSearch] = useState('')
  const [examFilter, setExamFilter] = useState('all')

  const filtered = tests.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (examFilter !== 'all' && t.examType !== examFilter) return false
    return true
  })

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Управление на тестове" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-sm text-text-muted">{tests.length} теста общо</p>
          <button className="btn-primary text-sm">Добави тест</button>
        </div>

        <div className="card p-4 mb-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Търси тест..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="input-field">
              <option value="all">Всички изпити</option>
              <option value="nvo7">7. клас НВО</option>
              <option value="dzi12">12. клас ДЗИ</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Тест</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Изпит</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Трудност</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Въпроси</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Решения</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Достъп</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((test) => (
                  <tr key={test.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text">{test.title}</p>
                      <p className="text-xs text-text-muted">{test.subjectName} · {test.topicName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={test.examType === 'nvo7' ? 'primary' : 'amber'}>
                        {test.examType === 'nvo7' ? 'НВО' : 'ДЗИ'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text">{test.questionsCount}</td>
                    <td className="px-4 py-3 text-sm text-text">{test.completedCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={test.isPremium ? 'amber' : 'success'}>
                        {test.isPremium ? 'Премиум' : 'Безплатен'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-primary hover:underline font-medium">Редактирай</button>
                        <button className="text-xs text-text-muted hover:text-text">Дублирай</button>
                        <button className="text-xs text-danger hover:underline">Изтрий</button>
                      </div>
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
