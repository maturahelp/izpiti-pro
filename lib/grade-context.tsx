'use client'

import { createContext, useContext, useState } from 'react'

type Grade = '7' | '12'

interface GradeContextValue {
  grade: Grade
  setGrade: (grade: Grade) => void
}

const GradeContext = createContext<GradeContextValue>({
  grade: '12',
  setGrade: () => {},
})

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [grade, setGrade] = useState<Grade>('12')

  return (
    <GradeContext.Provider value={{ grade, setGrade }}>
      {children}
    </GradeContext.Provider>
  )
}

export function useGrade() {
  return useContext(GradeContext)
}
