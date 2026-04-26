import type { Metadata } from 'next'
import { Sidebar } from '@/components/dashboard/Sidebar'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { MobileNav } from '@/components/dashboard/MobileNav'
import { GradeProvider } from '@/lib/grade-context'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GradeProvider>
      <div className="min-h-screen bg-bg">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="md:ml-56">
          {children}
        </div>
        <MobileNav />
      </div>
    </GradeProvider>
  )
}
