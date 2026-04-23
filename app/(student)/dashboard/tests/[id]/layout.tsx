import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasActivePremium } from '@/lib/subscription-access'

export default async function TestAccessLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  if (!supabase) {
    redirect(`/login?redirectTo=/dashboard/tests/${id}`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectTo=/dashboard/tests/${id}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_active, plan_expires_at')
    .eq('id', user.id)
    .single()

  if (!hasActivePremium(profile)) {
    redirect('/dashboard/subscription')
  }

  return <>{children}</>
}
