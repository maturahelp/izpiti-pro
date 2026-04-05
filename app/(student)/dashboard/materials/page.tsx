'use client'

import { TopBar } from '@/components/dashboard/TopBar'
import { Badge } from '@/components/shared/Badge'
import { beronTests } from '@/data/beron-tests'
import { getDifficultyColor } from '@/lib/utils'
import Link from 'next/link'

const beronMaterials = beronTests

export default function MaterialsPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Материали" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        <p className="text-text-muted text-sm mb-6">
          {beronMaterials.length} BERON теста за упражнение
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {beronMaterials.map((test) => (
            <div key={test.id} className="card-hover p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant="primary">BERON</Badge>
                    <Badge variant={test.examType === 'nvo7' ? 'primary' : 'amber'}>
                      {test.examType === 'nvo7' ? '7. клас НВО' : '12. клас ДЗИ'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-text text-sm leading-snug">{test.title}</h3>
                  <p className="text-xs text-text-muted mt-1">{test.subjectName} · {test.topicName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {test.timeMinutes} мин.
                </span>
                <span>{test.questionsCount} въпроса</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge text-xs ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </span>
                <Link
                  href={`/dashboard/tests/${test.id}`}
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors bg-primary text-white hover:bg-primary-dark"
                >
                  Започни
                </Link>
              </div>
            </div>
          ))}
        </div>

        {beronMaterials.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="font-medium mb-1">Няма налични материали</p>
            <p className="text-sm">Няма BERON тестове за твоя клас.</p>
          </div>
        )}
      </div>
    </div>
  )
}
