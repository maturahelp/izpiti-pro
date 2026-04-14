import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { isAdminProfile } from '@/lib/profile'
import { getServerAccess } from '@/lib/server-access'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getServerAccess()

  if (!user) {
    redirect('/login?next=/admin')
  }

  if (!isAdminProfile(profile)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar />
      <div className="ml-56">
        {children}
      </div>
    </div>
  )
}
