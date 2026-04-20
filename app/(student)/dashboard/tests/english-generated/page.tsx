import { TopBar } from '@/components/dashboard/TopBar'
import { EnglishGeneratedMaterialsPage } from '@/components/english-generated/EnglishGeneratedMaterialsPage'

export default function EnglishGeneratedDashboardPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Английски практика" />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <EnglishGeneratedMaterialsPage />
      </div>
    </div>
  )
}
