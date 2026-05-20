import type { SupabaseClient } from '@supabase/supabase-js'
import { getPlanAiDailyLimit, isPlanKey, type PlanKey } from '@/lib/billing/plans'
import { hasActivePremium, type SubscriptionAccessProfile } from '@/lib/subscription-access'

export const FREE_DAILY_LIMIT = 1

/**
 * Връща дневния лимит за AI чат за дадения профил:
 *  - null = неограничен (full платени планове)
 *  - число = твърд лимит / 24h (sprint планове или free)
 */
function resolveDailyLimit(
  profile: (SubscriptionAccessProfile & { class?: string | null }) | null | undefined
): number | null {
  if (!hasActivePremium(profile ?? null)) return FREE_DAILY_LIMIT
  const planKey = profile?.billing_plan_key
  if (planKey && isPlanKey(planKey)) {
    return getPlanAiDailyLimit(planKey as PlanKey)
  }
  return null
}

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
 * Атомарна квота: премиум потребители не се лимитират; безплатни — 1 / ден.
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
  const limit = resolveDailyLimit(profile)

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
  const limit = resolveDailyLimit(profile)

  if (limit === null) return { remaining: null, plan }

  // UTC day boundary.
  const today = new Date().toISOString().slice(0, 10)

  const { data: usage } = await admin
    .from('ai_usage')
    .select('period_start, count')
    .eq('user_id', userId)
    .maybeSingle<{ period_start: string; count: number }>()

  const used = usage && usage.period_start === today ? usage.count : 0
  return { remaining: Math.max(limit - used, 0), plan }
}
