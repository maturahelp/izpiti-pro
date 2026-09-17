import { TopBar } from '@/components/dashboard/TopBar'
import { PremiumLockedCard } from '@/components/dashboard/PremiumLockedCard'
import { hasFullContentEntitlement } from '@/lib/content-entitlement'
import { isFreeBelNvoTopic } from '@/lib/free-content'
import { CurriculumTopicClient, type CurriculumTopic } from './CurriculumTopicClient'

function parseTopicIndex(raw: string): number | null {
  const index = Number(raw)
  return Number.isInteger(index) && index >= 0 ? index : null
}

function NotFound() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Тема не е намерена" />
      <div className="p-6 text-center text-text-muted">
        <p>Темата не съществува.</p>
      </div>
    </div>
  )
}

export default async function CurriculumTopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const index = parseTopicIndex(id)
  if (index === null) return <NotFound />

  if (!isFreeBelNvoTopic(index)) {
    const entitled = await hasFullContentEntitlement()
    if (!entitled) {
      return (
        <PremiumLockedCard
          title="Учебна тема"
          heading="Тази учебна тема е част от платен план"
          description="Активирай абонамент, за да отключиш всички учебни теми по БЕЛ за НВО."
        />
      )
    }
  }

  // Imported here (server-only render path) so the full curriculum dataset
  // never ships to the client for users who aren't entitled to it.
  const { default: topicsData } = await import('@/data/bel_curriculum_topics_content.json')
  const topic = (topicsData.topics as CurriculumTopic[])[index]

  if (!topic) return <NotFound />

  return <CurriculumTopicClient id={index} topic={topic} />
}
