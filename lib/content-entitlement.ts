import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canAccessFullContent, type SubscriptionAccessProfile } from '@/lib/subscription-access'

/**
 * Server-only entitlement check for premium study content.
 *
 * Reads the session from cookies and the profile via the admin client, then
 * applies `canAccessFullContent`. Use it in Server Component pages BEFORE
 * importing a heavy dataset, so non-entitled visitors never receive the data
 * (neither in HTML nor in a client JS chunk).
 */
export async function hasFullContentEntitlement(): Promise<boolean> {
  const supabase = await createClient()
  if (!supabase) return false

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role, plan, is_active, plan_expires_at, billing_status, billing_plan_key')
    .eq('id', user.id)
    .maybeSingle<SubscriptionAccessProfile>()

  return canAccessFullContent(profile)
}
