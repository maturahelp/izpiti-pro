import { PremiumLockedCard } from '@/components/dashboard/PremiumLockedCard'
import { hasFullContentEntitlement } from '@/lib/content-entitlement'
import { isFreeMathNvoSubtopic } from '@/lib/free-content'
import { Math7TopicsClient, type MathTopic } from './Math7TopicsClient'

/**
 * Server-gated math practice for 7. клас.
 *
 * Only FREE_MATH_NVO_SUBTOPIC_ID opens without a plan. The problem bank is
 * imported here (server render path) and stripped down before it reaches the
 * client: locked subtopics keep their title and problem count for the grid,
 * but their problems (and answers) are never sent to a non-entitled visitor.
 */
export default async function Math7TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ subtopic?: string | string[] }>
}) {
  const { subtopic } = await searchParams
  const requestedSubtopicId = Array.isArray(subtopic) ? subtopic[0] ?? null : subtopic ?? null

  const entitled = await hasFullContentEntitlement()

  const { default: problemBank } = await import('@/data/nvo_7_math_generated_problem_bank.json')
  const bankTopics = problemBank.topics as Array<
    Omit<MathTopic, 'subtopics'> & {
      subtopics: Array<Omit<MathTopic['subtopics'][number], 'problemCount' | 'locked'>>
    }
  >

  const topics: MathTopic[] = bankTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    subtopics: topic.subtopics.map((sub) => {
      const locked = !entitled && !isFreeMathNvoSubtopic(topic.id, sub.id)
      return {
        id: sub.id,
        title: sub.title,
        sourceInspiredBy: sub.sourceInspiredBy,
        problemCount: sub.problems.length,
        locked,
        problems: locked ? [] : sub.problems,
      }
    }),
  }))

  if (requestedSubtopicId) {
    const requested = topics
      .flatMap((topic) => topic.subtopics)
      .find((sub) => sub.id === requestedSubtopicId)
    if (requested?.locked) {
      return (
        <PremiumLockedCard
          title="Математика по теми"
          heading="Тази подтема е част от платен план"
          description="Активирай абонамент, за да отключиш всички 27 подтеми и 540 задачи по математика за НВО."
        />
      )
    }
  }

  return <Math7TopicsClient topics={topics} initialSubtopicId={requestedSubtopicId} />
}
