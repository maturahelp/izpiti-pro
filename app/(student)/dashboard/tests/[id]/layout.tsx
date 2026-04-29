import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasActivePremium } from '@/lib/subscription-access'

// Past DZI/NVO exams are part of the free plan. Sample/mock tests stay premium.
function isPastExamId(id: string) {
  if (id.startsWith('mock_')) return false
  if (id.startsWith('selected_mock_')) return false
  if (id.startsWith('english-generated-')) return false
  if (/^q\d+$/i.test(id)) return false
  return true
}

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

  if (isPastExamId(id)) {
    return <>{children}</>
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
