import { TopBar } from '@/components/dashboard/TopBar'
import { PremiumLockedCard } from '@/components/dashboard/PremiumLockedCard'
import { hasFullContentEntitlement } from '@/lib/content-entitlement'
import { isFreeBelDziRule } from '@/lib/free-content'
import { RuleQuizClient, type RuleTopic } from './RuleQuizClient'

interface RuleSection {
  title: string
  topics: RuleTopic[]
}

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

export default async function RuleQuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const index = parseTopicIndex(id)
  if (index === null) return <NotFound />

  if (!isFreeBelDziRule(index)) {
    const entitled = await hasFullContentEntitlement()
    if (!entitled) {
      return (
        <PremiumLockedCard
          title="Тест"
          heading="Този тест е част от платен план"
          description="Активирай абонамент, за да отключиш всички тестове по правилата за ДЗИ."
        />
      )
    }
  }

  // Imported here (server-only render path) so the full question bank never
  // ships to the client for users who aren't entitled to it.
  const { default: questionBank } = await import('@/data/bel_topics_question_bank.json')

  // Flat topic order across sections — must match ruleTopicIndex in materials/page.tsx.
  let flatIndex = 0
  let entry: { sectionTitle: string; topic: RuleTopic } | null = null
  for (const section of questionBank.sections as RuleSection[]) {
    for (const topic of section.topics) {
      if (flatIndex === index) {
        entry = { sectionTitle: section.title, topic }
        break
      }
      flatIndex += 1
    }
    if (entry) break
  }

  if (!entry) return <NotFound />

  return <RuleQuizClient id={index} sectionTitle={entry.sectionTitle} topic={entry.topic} />
}
