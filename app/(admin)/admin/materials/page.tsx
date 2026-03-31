import { materials, materialTypeLabels } from '@/data/materials'
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

export default function AdminMaterialsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar title="Учебни материали" />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-text-muted">{materials.length} материала</p>
          <button className="btn-primary text-sm">Добави материал</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Материал</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Тип</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Изтегляния</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Достъп</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text">{mat.title}</p>
                      <p className="text-xs text-text-muted">{mat.subjectName} · {mat.topicName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">{materialTypeLabels[mat.type]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text">{mat.downloadCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={mat.access === 'premium' ? 'amber' : 'success'}>
                        {mat.access === 'premium' ? 'Премиум' : 'Безплатен'}
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
