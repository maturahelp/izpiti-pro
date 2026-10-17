import { PremiumLockedCard } from '@/components/dashboard/PremiumLockedCard'
import { resolveLiteratureExercisePage } from '@/data/literatureExerciseResolver'
import { hasFullContentEntitlement } from '@/lib/content-entitlement'
import { isFreeLiteratureWork } from '@/lib/free-content'
import { LiteratureExerciseClient, LiteratureExerciseNotFound } from './LiteratureExerciseClient'

/**
 * Server-gated literature exercise. Only the two free works per grade
 * (FREE_LITERATURE_WORK_IDS) open without a plan; everything else requires
 * `canAccessFullContent`. The exercise is resolved here so the client chunk
 * never contains the other works' question banks.
 */
export default async function LiteratureExercisePage({
  params,
}: {
  params: Promise<{ workId: string }>
}) {
  const { workId } = await params

  if (!isFreeLiteratureWork(workId)) {
    const entitled = await hasFullContentEntitlement()
    if (!entitled) {
      return (
        <PremiumLockedCard
          title="Упражнение"
          heading="Това упражнение е част от платен план"
          description="Активирай абонамент, за да отключиш упражненията към всички литературни произведения."
        />
      )
    }
  }

  const resolved = resolveLiteratureExercisePage(workId)
  if (!resolved) {
    return <LiteratureExerciseNotFound />
  }

  return <LiteratureExerciseClient resolved={resolved} />
}
