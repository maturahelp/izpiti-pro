'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { materialTypeLabels, type MaterialType } from '@/data/materials'
import { studentMaterials as materials, studentSubjects as subjects } from '@/data/student-content'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const typeIcons: Record<MaterialType, JSX.Element> = {
  notes: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  pdf: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M9 15v-4M12 15v-6M15 15v-2"/>
    </svg>
  ),
  summary: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 10h16M4 14h10"/>
    </svg>
  ),
  scheme: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <path d="M17.5 17.5h.01M17.5 14H20M17.5 21H20M17.5 17.5H14"/>
    </svg>
  ),
}

export default function MaterialsPage() {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAccess, setSelectedAccess] = useState<string>('all')

  const filtered = materials.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedSubject !== 'all' && m.subjectId !== selectedSubject) return false
    if (selectedType !== 'all' && m.type !== selectedType) return false
    if (selectedAccess !== 'all' && m.access !== selectedAccess) return false
    return true
  })

  const typeColors: Record<MaterialType, string> = {
    notes: 'text-primary bg-primary-light',
    pdf: 'text-danger bg-danger-light',
    summary: 'text-success bg-success-light',
    scheme: 'text-amber bg-amber-light',
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Материали" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        <p className="text-text-muted text-sm mb-6">{materials.length} учебни материала за сваляне и четене</p>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Търси материал..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-field">
              <option value="all">Всички предмети</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="input-field">
              <option value="all">Всички типове</option>
              {Object.entries(materialTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={selectedAccess} onChange={(e) => setSelectedAccess(e.target.value)} className="input-field">
              <option value="all">Всеки достъп</option>
              <option value="free">Безплатни</option>
              <option value="premium">Премиум</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Намерени: <strong className="text-text">{filtered.length}</strong> материала
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((material) => (
            <div key={material.id} className={cn(
              'card-hover p-5 flex flex-col gap-3',
              material.access === 'premium' && 'border-amber/20'
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  typeColors[material.type]
                )}>
                  {typeIcons[material.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={cn('badge text-[10px]', typeColors[material.type])}>
                      {materialTypeLabels[material.type]}
                    </span>
                    {material.access === 'premium' && (
                      <span className="badge badge-amber text-[10px]">Премиум</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-text text-sm leading-snug">{material.title}</h3>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{material.description}</p>

              <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                <span>{material.subjectName}</span>
                <div className="flex items-center gap-2">
                  {material.pages && <span>{material.pages} стр.</span>}
                  <span>{material.downloadCount.toLocaleString()} изтегляния</span>
                </div>
              </div>

              <button
                className={cn(
                  'w-full text-xs font-semibold py-2 rounded-lg transition-colors',
                  material.access === 'premium'
                    ? 'bg-amber-light text-amber border border-amber/20 hover:bg-amber/20'
                    : 'bg-primary text-white hover:bg-primary-dark'
                )}
              >
                {material.access === 'premium' ? 'Отключи с Премиум' : 'Отвори материала'}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="font-medium mb-1">Няма намерени материали</p>
            <p className="text-sm">Промени филтрите, за да видиш резултати.</p>
          </div>
        )}
      </div>
    </div>
  )
}
