import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
