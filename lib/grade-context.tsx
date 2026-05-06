'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Grade = '7' | '12'

interface GradeContextValue {
  grade: Grade
  setGrade: (grade: Grade) => void
  lockedGrade: Grade | null
  isGradeLocked: boolean
  availableGrades: Grade[]
}

const GradeContext = createContext<GradeContextValue>({
  grade: '12',
  setGrade: () => {},
  lockedGrade: null,
  isGradeLocked: false,
  availableGrades: ['7', '12'],
})

const STORAGE_KEY = 'grade'

function isValidGrade(value: string | null): value is Grade {
  return value === '7' || value === '12'
}

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [grade, setGradeState] = useState<Grade>('12')
  const [lockedGrade, setLockedGrade] = useState<Grade | null>(null)

  // Hydrate from localStorage on mount (client-only to keep SSR output stable).
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (isValidGrade(stored)) {
          setGradeState(stored)
        }
      } catch {
        // ignore — localStorage may be unavailable (SSR, private mode, etc.)
      }
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let supabase

    try {
      supabase = createClient()
    } catch {
      return () => {
        cancelled = true
      }
    }

    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled || !user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', user.id)
        .single()

      if (cancelled) return

      const profileClass = profile?.class ?? null
      const nextLockedGrade = isValidGrade(profileClass) ? profileClass : null

      setLockedGrade(nextLockedGrade)

      if (nextLockedGrade) {
        setGradeState(nextLockedGrade)
        try {
          localStorage.setItem(STORAGE_KEY, nextLockedGrade)
        } catch {
          // ignore
        }
      }
    })().catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const setGrade = (next: Grade) => {
    const finalGrade = lockedGrade ?? next
    if (lockedGrade && next !== lockedGrade) return

    setGradeState(finalGrade)
    try {
      localStorage.setItem(STORAGE_KEY, finalGrade)
    } catch {
      // ignore
    }
  }

  return (
    <GradeContext.Provider
      value={{
        grade,
        setGrade,
        lockedGrade,
        isGradeLocked: lockedGrade !== null,
        availableGrades: lockedGrade ? [lockedGrade] : ['7', '12'],
      }}
    >
      {children}
    </GradeContext.Provider>
  )
}

export function useGrade() {
  return useContext(GradeContext)
}
