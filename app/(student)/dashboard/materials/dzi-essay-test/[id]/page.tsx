import { TopBar } from '@/components/dashboard/TopBar'
import { PremiumLockedCard } from '@/components/dashboard/PremiumLockedCard'
import { hasFullContentEntitlement } from '@/lib/content-entitlement'
import { isFreeDziEssayMaterial } from '@/lib/free-content'
import { DziEssayQuizClient } from './DziEssayQuizClient'

function NotFound() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Тестът не е намерен" />
      <div className="p-6 text-center text-text-muted">
        <p>Този тест не съществува.</p>
      </div>
    </div>
  )
}

export default async function DziEssayQuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!isFreeDziEssayMaterial(id)) {
    const entitled = await hasFullContentEntitlement()
    if (!entitled) {
      return (
        <PremiumLockedCard
          title="Тест"
          heading="Този тест е част от платен план"
          description="Активирай абонамент, за да отключиш тестовете върху есе и интерпретативно съчинение за ДЗИ."
        />
      )
    }
  }

  // Imported here (server-only render path) so the essay materials dataset
  // never ships to the client for users who aren't entitled to it.
  const { dziEssayMaterials } = await import('@/data/dziEssayMaterials')
  const material = dziEssayMaterials.find((item) => item.id === id)

  if (!material) return <NotFound />

  // Only the fields the quiz needs — the theory sections stay on the server.
  return (
    <DziEssayQuizClient
      material={{
        id: material.id,
        group: material.group,
        title: material.title,
        quiz: material.quiz,
      }}
    />
  )
}
