'use client'

import { subjects } from '@/data/subjects'
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

export default function AdminSubjectsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar title="Предмети и теми" />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-text-muted">{subjects.length} предмета общо</p>
          <button className="btn-primary text-sm">Добави предмет</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: subject.color + '18', color: subject.color }}
                  >
                    {subject.code}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text text-sm leading-snug">{subject.name}</h3>
                    <Badge variant={subject.examType === 'nvo7' ? 'primary' : 'amber'} className="mt-1">
                      {subject.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Теми', value: subject.topicsCount },
                  { label: 'Тестове', value: subject.testsCount },
                  { label: 'Уроци', value: subject.lessonsCount },
                ].map((stat) => (
                  <div key={stat.label} className="bg-bg rounded-lg p-2 text-center">
                    <p className="text-base font-bold text-text font-serif">{stat.value}</p>
                    <p className="text-[10px] text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button className="text-xs text-primary hover:underline font-medium flex-1 text-center py-1.5 bg-primary-light rounded-lg">
                  Виж темите
                </button>
                <button className="text-xs text-text-muted hover:text-text px-2 py-1.5">Редактирай</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
