'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { getUser } from '@/lib/auth'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getUser().then(user => {
      if (!user) {
        router.replace('/')
      } else {
        setReady(true)
      }
    })
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
