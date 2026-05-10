import type { SupabaseClient } from '@supabase/supabase-js'
import { hasActivePremium, type SubscriptionAccessProfile } from '@/lib/subscription-access'

export const FREE_WEEKLY_LIMIT = 5

export type StudentClass = 7 | 12 | null

export type QuotaResult =
  | {
      allowed: true
      remaining: number | null
      plan: 'free' | 'premium'
      studentClass: StudentClass
    }
  | {
      allowed: false
      remaining: 0
      plan: 'free' | 'premium'
      studentClass: StudentClass
    }

function parseClass(value: unknown): StudentClass {
  if (value === '7' || value === 7) return 7
  if (value === '12' || value === 12) return 12
  return null
}

/**
 * Атомарна квота: премиум потребители не се лимитират; безплатни — 5 / седмица.
 * Връща remaining=null когато достъпът е неограничен.
 *
 * IMPORTANT: трябва да се извика със service-role клиент, защото
 * check_and_increment_ai_usage е SECURITY DEFINER и достъпен само на
 * service_role.
 */
export async function checkAndIncrementQuota(
  admin: SupabaseClient,
  userId: string
): Promise<QuotaResult> {
  const { data: profile } = await admin
    .from('profiles')
    .select(
      'plan, is_active, plan_expires_at, billing_status, billing_plan_key, cancel_at_period_end, current_period_end, class'
    )
    .eq('id', userId)
    .maybeSingle<SubscriptionAccessProfile & { class?: string | null }>()

  const isPremium = hasActivePremium(profile ?? null)
  const plan: 'free' | 'premium' = isPremium ? 'premium' : 'free'
  const studentClass = parseClass(profile?.class)
  const limit = isPremium ? null : FREE_WEEKLY_LIMIT

  const { data, error } = await admin.rpc('check_and_increment_ai_usage', {
    p_user_id: userId,
    p_limit: limit,
  })

  if (error) {
    console.error('[ai/quota] check_and_increment_ai_usage error', error)
    // Fail-closed за безплатни (не пускай при грешка), отворено за премиум.
    if (isPremium) return { allowed: true, remaining: null, plan, studentClass }
    return { allowed: false, remaining: 0, plan, studentClass }
  }

  const remainingRaw = typeof data === 'number' ? data : Number(data)

  if (limit === null) {
    return { allowed: true, remaining: null, plan, studentClass }
  }

  if (remainingRaw < 0) {
    return { allowed: false, remaining: 0, plan, studentClass }
  }

  return { allowed: true, remaining: remainingRaw, plan, studentClass }
}

/**
 * Read-only вариант — за GET /api/ai/usage. Не променя count.
 */
export async function readQuota(
  admin: SupabaseClient,
  userId: string
): Promise<{ remaining: number | null; plan: 'free' | 'premium' }> {
  const { data: profile } = await admin
    .from('profiles')
    .select(
      'plan, is_active, plan_expires_at, billing_status, billing_plan_key, cancel_at_period_end, current_period_end'
    )
    .eq('id', userId)
    .maybeSingle<SubscriptionAccessProfile>()

  const isPremium = hasActivePremium(profile ?? null)
  const plan: 'free' | 'premium' = isPremium ? 'premium' : 'free'

  if (isPremium) return { remaining: null, plan }

  // ISO Monday week start.
  const now = new Date()
  const day = now.getUTCDay() // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? 6 : day - 1
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday))
  const weekStart = monday.toISOString().slice(0, 10)

  const { data: usage } = await admin
    .from('ai_usage')
    .select('week_start, count')
    .eq('user_id', userId)
    .maybeSingle<{ week_start: string; count: number }>()

  const used = usage && usage.week_start === weekStart ? usage.count : 0
  return { remaining: Math.max(FREE_WEEKLY_LIMIT - used, 0), plan }
}
