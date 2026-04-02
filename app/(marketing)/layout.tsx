import { NavDrawerProvider, NavDrawerPanel, LoginGateModal } from '@/components/marketing/NavDrawer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavDrawerProvider>
      <div className="min-h-screen bg-white">
        {children}
      </div>
      <NavDrawerPanel />
      <LoginGateModal />
    </NavDrawerProvider>
  )
}
