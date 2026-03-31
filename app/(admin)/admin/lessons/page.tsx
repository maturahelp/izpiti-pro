import { lessons } from '@/data/lessons'
import { Badge } from '@/components/shared/Badge'
import { formatDuration } from '@/lib/utils'

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

export default function AdminLessonsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar title="Аудио уроци" />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-text-muted">{lessons.length} аудио урока</p>
          <button className="btn-primary text-sm">Добави урок</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Урок</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Изпит</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Продължителност</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Достъп</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text">{lesson.title}</p>
                      <p className="text-xs text-text-muted">{lesson.subjectName} · {lesson.topicName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lesson.examType === 'nvo7' ? 'primary' : 'amber'}>
                        {lesson.examType === 'nvo7' ? 'НВО' : 'ДЗИ'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-text">{formatDuration(lesson.durationSeconds)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={lesson.isPremium ? 'amber' : 'success'}>
                        {lesson.isPremium ? 'Премиум' : 'Безплатен'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-primary hover:underline font-medium">Редактирай</button>
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
