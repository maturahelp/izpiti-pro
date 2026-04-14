import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { GradeProvider } from '@/lib/grade-context'
import { getServerAccess } from '@/lib/server-access'
import { redirect } from 'next/navigation'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getServerAccess()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

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
