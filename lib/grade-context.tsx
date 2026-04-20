'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Grade = '7' | '12'

interface GradeContextValue {
  grade: Grade
  setGrade: (grade: Grade) => void
}

const GradeContext = createContext<GradeContextValue>({
  grade: '12',
  setGrade: () => {},
})

const STORAGE_KEY = 'grade'

function isValidGrade(value: string | null): value is Grade {
  return value === '7' || value === '12'
}

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [grade, setGradeState] = useState<Grade>('12')

  // Hydrate from localStorage on mount (client-only to keep SSR output stable).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isValidGrade(stored)) {
        setGradeState(stored)
      }
    } catch {
      // ignore — localStorage may be unavailable (SSR, private mode, etc.)
    }
  }, [])

  const setGrade = (next: Grade) => {
    setGradeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  return (
    <GradeContext.Provider value={{ grade, setGrade }}>
      {children}
    </GradeContext.Provider>
  )
}

export function useGrade() {
  return useContext(GradeContext)
}
