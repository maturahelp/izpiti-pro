import { getDziExerciseForWork } from './dziLiteratureExercises'
import { literatureWorks } from './literatureWorks'
import { getExerciseForWork, type LiteratureExerciseSet } from './nvoLiteratureExercises'
import { nvoLiteratureWorks } from './nvoLiteratureWorks'

type ExerciseGrade = 7 | 12

export type ResolvedLiteratureExercisePage = {
  grade: ExerciseGrade
  work: {
    id: string
    author: string
    title: string
    image: string
  }
  exercise: LiteratureExerciseSet
}

export function resolveLiteratureExercisePage(workId: string): ResolvedLiteratureExercisePage | null {
  const nvoWork = nvoLiteratureWorks.find((item) => item.id === workId)
  if (nvoWork) {
    const exercise = getExerciseForWork(workId)
    if (!exercise) return null

    return {
      grade: 7,
      work: {
        id: nvoWork.id,
        author: nvoWork.author,
        title: nvoWork.title,
        image: nvoWork.image,
      },
      exercise,
    }
  }

  const dziWork = literatureWorks.find((item) => item.id === workId)
  if (dziWork) {
    const exercise = getDziExerciseForWork(workId)
    if (!exercise) return null

    return {
      grade: 12,
      work: {
        id: dziWork.id,
        author: dziWork.author,
        title: dziWork.title,
        image: dziWork.image,
      },
      exercise,
    }
  }

  return null
}
