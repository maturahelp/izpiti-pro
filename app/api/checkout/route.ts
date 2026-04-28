import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BILLING_PLANS, isPlanKey } from '@/lib/billing/plans'
import { hasActivePremium } from '@/lib/subscription-access'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://izpiti.pro'

type ProfileBillingSnapshot = {
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  billing_plan_key: string | null
  billing_status: string | null
  plan: string | null
  is_active: boolean | null
  plan_expires_at: string | null
  cancel_at_period_end: boolean | null
}

/**
 * Resolve-ва existing stripe customer за user-а:
 *  1. ако profile.stripe_customer_id вече е записан — reuse
 *  2. иначе търси по email в Stripe (rare: customer създаден преди миграция)
 *  3. иначе създава нов customer
 * Записва customer.id в profiles веднага, за да не дублираме.
 */
async function ensureStripeCustomerId(
  stripe: Stripe,
  userId: string,
  email: string,
  existing: string | null
): Promise<string> {
  if (existing) return existing

  const search = await stripe.customers.list({ email, limit: 1 })
  let customerId = search.data[0]?.id ?? null

  if (!customerId) {
    const created = await stripe.customers.create({
      email,
      metadata: { userId },
    })
    customerId = created.id
  }

  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
    .eq('id', userId)

  return customerId
}

async function createCheckoutSession(stripe: Stripe, user: { id: string; email: string }, plan: string) {
  const config = BILLING_PLANS[plan as keyof typeof BILLING_PLANS]

  const admin = createAdminClient()
  const { data: profileSnapshot } = await admin
    .from('profiles')
    .select(
      'stripe_customer_id, stripe_subscription_id, billing_plan_key, billing_status, plan, is_active, plan_expires_at, cancel_at_period_end'
    )
    .eq('id', user.id)
    .maybeSingle<ProfileBillingSnapshot>()

  const existingCustomerId = profileSnapshot?.stripe_customer_id ?? null
  const existingSubscriptionId = profileSnapshot?.stripe_subscription_id ?? null
  const existingPlanKey = profileSnapshot?.billing_plan_key ?? null
  const existingStatus = profileSnapshot?.billing_status ?? null
  const currentlyActive = hasActivePremium(profileSnapshot)

  if (
    config.mode === 'subscription' &&
    currentlyActive &&
    existingPlanKey === plan &&
    existingStatus &&
    !['canceled', 'incomplete_expired', 'unpaid'].includes(existingStatus) &&
    profileSnapshot?.cancel_at_period_end !== true
  ) {
    return { error: 'ALREADY_ACTIVE', status: 409 as const }
  }

  if (config.mode === 'payment' && currentlyActive && existingPlanKey === plan) {
    return { error: 'ALREADY_ACTIVE', status: 409 as const }
  }

  const customerId = await ensureStripeCustomerId(stripe, user.id, user.email, existingCustomerId)

  const metadata = { planKey: plan, userId: user.id, userEmail: user.email }

  const session = await stripe.checkout.sessions.create({
    mode: config.mode,
    client_reference_id: user.id,
    customer: customerId,
    metadata,
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: config.currency,
          unit_amount: config.amount,
          product_data: { name: config.name },
          ...(config.mode === 'subscription' ? { recurring: { interval: 'month' } } : {}),
        },
        quantity: 1,
      },
    ],
    ...(config.mode === 'payment'
      ? { payment_intent_data: { metadata } }
      : { subscription_data: { metadata } }),
    success_url: `${BASE_URL}/dashboard/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/#pricing`,
  })

  if (
    existingSubscriptionId &&
    currentlyActive &&
    profileSnapshot?.cancel_at_period_end !== true &&
    (config.mode === 'payment' || existingPlanKey !== plan)
  ) {
    try {
      const existing = await stripe.subscriptions.retrieve(existingSubscriptionId)
      if (existing.status !== 'canceled' && !existing.cancel_at_period_end) {
        await stripe.subscriptions.update(existingSubscriptionId, {
          cancel_at_period_end: true,
          metadata: {
            ...existing.metadata,
            superseded_by_plan: plan,
            superseded_at: new Date().toISOString(),
          },
        })
      }
    } catch (err) {
      console.error('[checkout] failed to schedule prior subscription cancel', err)
    }
  }

  return { url: session.url }
}

/**
 * GET /api/checkout/redirect?plan=<planKey>
 * Used after registration to complete the checkout flow the student started.
 * If the user is not authenticated, bounces back to /register with the same redirectTo.
 */
export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('plan') ?? ''

  if (!isPlanKey(plan)) {
    return NextResponse.redirect(new URL('/#pricing', BASE_URL))
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL('/#pricing', BASE_URL))
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.redirect(new URL('/#pricing', BASE_URL))
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    const redirectTo = encodeURIComponent(`/api/checkout/redirect?plan=${plan}`)
    return NextResponse.redirect(new URL(`/register?redirectTo=${redirectTo}`, BASE_URL))
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const result = await createCheckoutSession(stripe, { id: user.id, email: user.email }, plan)

    if ('error' in result) {
      return NextResponse.redirect(new URL('/dashboard/subscription', BASE_URL))
    }

    return NextResponse.redirect(result.url!)
  } catch (err) {
    console.error('[checkout/redirect] Stripe error:', err)
    return NextResponse.redirect(new URL('/#pricing', BASE_URL))
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const payload = (await req.json()) as { plan?: string }

  if (!payload.plan || !isPlanKey(payload.plan)) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  try {
    const result = await createCheckoutSession(stripe, { id: user.id, email: user.email }, payload.plan)

    if ('error' in result) {
      return NextResponse.json(
        {
          error: result.error,
          message:
            result.error === 'ALREADY_ACTIVE'
              ? 'Вече имаш активен абонамент по този план.'
              : 'Грешка при създаване на сесия.',
        },
        { status: result.status }
      )
    }

    return NextResponse.json({ url: result.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
