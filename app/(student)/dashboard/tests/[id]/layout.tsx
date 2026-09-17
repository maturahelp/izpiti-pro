import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  canAccessEnglishContent,
  canAccessFullContent,
  hasActivePremium,
} from '@/lib/subscription-access'
import { isFreeMockExam } from '@/lib/free-content'

// Past DZI/NVO exams are part of the free plan. Sample/mock tests stay premium,
// except the single free mock exam per grade (see lib/free-content.ts).
function isPastExamId(id: string) {
  if (id.startsWith('mock_')) return false
  if (id.startsWith('selected_mock_')) return false
  if (id.startsWith('english-generated-')) return false
  if (/^q\d+$/i.test(id)) return false
  return true
}

// Английски тестове (генерирани и официални английски матури) се отключват
// и от scope='english' планове като `dzi-english-sprint`.
function isEnglishTestId(id: string) {
  return id.startsWith('english-generated-') || id.startsWith('dzi-english-')
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

  // Официалните изпити от минали години са freemium, а един примерен изпит
  // на клас влиза в безплатния план — и двете минават без premium проверка.
  if (isPastExamId(id) || isFreeMockExam(id)) {
    return <>{children}</>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_active, plan_expires_at, billing_plan_key')
    .eq('id', user.id)
    .single()

  if (!hasActivePremium(profile)) {
    redirect('/dashboard/subscription')
  }

  // English тестове изискват само english-access (всеки активен план).
  // Останалите тестове изискват пълен план (без english-only sprint).
  const allowed = isEnglishTestId(id)
    ? canAccessEnglishContent(profile)
    : canAccessFullContent(profile)

  if (!allowed) {
    redirect('/dashboard/subscription')
  }

  return <>{children}</>
}
