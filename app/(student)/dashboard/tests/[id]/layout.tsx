import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { allTests } from '@/data/tests'

export default async function TestAccessLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const test = allTests.find((t) => t.id === id)

  // Non-premium test (or unknown id handled downstream): no extra gate needed —
  // dashboard/* is already auth-gated in middleware.
  if (!test?.isPremium) {
    return <>{children}</>
  }

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
    .select('plan, plan_expires_at')
    .eq('id', user.id)
    .single()

  const isActivePremium =
    profile?.plan === 'premium' &&
    (!profile?.plan_expires_at || new Date(profile.plan_expires_at) > new Date())

  if (!isActivePremium) {
    redirect('/dashboard/subscription')
  }

  return <>{children}</>
}
