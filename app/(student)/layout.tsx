'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { createClient } from '@/lib/supabase/client'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
      } else {
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (!ready) return null

  return (
    <div className="min-h-screen bg-bg">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:ml-56">
        {children}
      </div>
      <MobileNav />
    </div>
  )
}
