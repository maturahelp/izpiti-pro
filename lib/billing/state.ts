import type Stripe from 'stripe'
import { BILLING_PLANS, getOneTimePlanExpiry, isPlanKey, type PlanKey } from '@/lib/billing/plans'
import { createAdminClient } from '@/lib/supabase/admin'

export type BillingPatch = {
  plan: 'premium' | 'free'
  is_active: boolean
  plan_expires_at: string | null
  class?: '7' | '12'
  exam_path?: 'НВО' | 'ДЗИ'
  billing_plan_key: PlanKey | null
  billing_status: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  cancel_at_period_end: boolean
  cancel_at: string | null
  current_period_end: string | null
  last_payment_at?: string | null
  last_payment_status?: string | null
  updated_at: string
}

const ACCESS_GRANTING_STATUSES = new Set<Stripe.Subscription.Status>([
  'active',
  'trialing',
  // past_due: оставяме достъпа до края на платения период, webhook-ът
  // на invoice.payment_failed вече ще е свалил достъпа ако е приложимо.
  'past_due',
])

export function isAccessGrantingStatus(status: Stripe.Subscription.Status) {
  return ACCESS_GRANTING_STATUSES.has(status)
}

export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const itemPeriodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((timestamp): timestamp is number => typeof timestamp === 'number' && Number.isFinite(timestamp))

  if (itemPeriodEnds.length > 0) {
    return new Date(Math.max(...itemPeriodEnds) * 1000).toISOString()
  }

  if (typeof subscription.cancel_at === 'number') {
    return new Date(subscription.cancel_at * 1000).toISOString()
  }

  if (typeof subscription.ended_at === 'number') {
    return new Date(subscription.ended_at * 1000).toISOString()
  }

  if (typeof subscription.canceled_at === 'number') {
    return new Date(subscription.canceled_at * 1000).toISOString()
  }

  return null
}

/**
 * Приложи derived-snapshot обновяване върху profiles. Всички Stripe webhook
 * хендлъри минават през тази функция, за да е запис-ът атомарен и
 * предвидим. Ако profileId не е познат — хвърля грешка.
 *
 * Поведение:
 *   - Винаги записваме canonical billing колоните (stripe_customer_id,
 *     stripe_subscription_id, cancel_at_period_end и т.н.).
 *   - plan/is_active/plan_expires_at/class/exam_path се определят
 *     според patch.plan/is_active (за да не разминаваме snapshot-а).
 */
export async function applyBillingPatch(profileId: string, patch: BillingPatch) {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update(patch).eq('id', profileId)
  if (error) throw error
}

/**
 * Резолва userId (profiles.id) от Stripe customer ID. Използва се от
 * invoice/subscription webhook събития, които не носят metadata.userId.
 */
export async function resolveUserIdFromCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  return data?.id ?? null
}

export function buildOneTimePaymentPatch(planKey: PlanKey, customerId: string | null): BillingPatch {
  const config = BILLING_PLANS[planKey]
  const expires = getOneTimePlanExpiry(planKey)
  const now = new Date().toISOString()

  return {
    plan: 'premium',
    is_active: true,
    plan_expires_at: expires,
    class: config.class,
    exam_path: config.examPath,
    billing_plan_key: planKey,
    billing_status: 'paid',
    stripe_customer_id: customerId ?? undefined,
    stripe_subscription_id: null,
    cancel_at_period_end: false,
    cancel_at: null,
    current_period_end: expires,
    last_payment_at: now,
    last_payment_status: 'succeeded',
    updated_at: now,
  }
}

export function buildSubscriptionPatch(
  planKey: PlanKey,
  subscription: Stripe.Subscription,
  options: { lastPaymentAt?: string | null; lastPaymentStatus?: string | null } = {}
): BillingPatch {
  const config = BILLING_PLANS[planKey]
  const periodEnd = getSubscriptionPeriodEnd(subscription)
  const isActive = isAccessGrantingStatus(subscription.status)

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null

  return {
    plan: isActive ? 'premium' : 'free',
    is_active: isActive,
    plan_expires_at: periodEnd,
    class: config.class,
    exam_path: config.examPath,
    billing_plan_key: planKey,
    billing_status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    cancel_at_period_end: subscription.cancel_at_period_end === true,
    cancel_at:
      typeof subscription.cancel_at === 'number'
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
    current_period_end: periodEnd,
    last_payment_at: options.lastPaymentAt ?? null,
    last_payment_status: options.lastPaymentStatus ?? null,
    updated_at: new Date().toISOString(),
  }
}

export function resolvePlanKeyFromSubscription(subscription: Stripe.Subscription): PlanKey | null {
  const fromMeta = subscription.metadata?.planKey
  if (typeof fromMeta === 'string' && isPlanKey(fromMeta)) return fromMeta
  return null
}

/**
 * При поток на двойна покупка (user вече има recurring и купува нов),
 * отменяме стария subscription веднага в края на периода — за да не
 * плаща два пъти. Връща true ако е направено нещо.
 */
export async function cancelExistingSubscriptionIfAny(
  stripe: Stripe,
  currentSubscriptionId: string | null | undefined,
  excludeSubscriptionId?: string | null
): Promise<boolean> {
  if (!currentSubscriptionId || currentSubscriptionId === excludeSubscriptionId) {
    return false
  }

  try {
    const existing = await stripe.subscriptions.retrieve(currentSubscriptionId)
    if (existing.status === 'canceled' || existing.cancel_at_period_end) {
      return false
    }
    await stripe.subscriptions.update(currentSubscriptionId, {
      cancel_at_period_end: true,
      metadata: { ...existing.metadata, superseded_at: new Date().toISOString() },
    })
    return true
  } catch (err) {
    console.error('[billing] cancelExistingSubscriptionIfAny failed', err)
    return false
  }
}
