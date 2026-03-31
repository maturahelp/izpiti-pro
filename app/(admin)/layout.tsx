import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar />
      <div className="ml-56">
        {children}
      </div>
    </div>
  )
}
