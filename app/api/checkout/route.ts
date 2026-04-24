import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BILLING_PLANS, isPlanKey } from '@/lib/billing/plans'
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

  const plan = payload.plan
  const config = BILLING_PLANS[plan]

  // Зареждаме current billing snapshot, за да приложим safety checks.
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
  const currentlyActive =
    profileSnapshot?.plan === 'premium' && profileSnapshot?.is_active === true

  // Защита срещу double-charge: recurring → recurring за същия план,
  // докато абонаментът е активен и не е cancel_at_period_end.
  if (
    config.mode === 'subscription' &&
    currentlyActive &&
    existingPlanKey === plan &&
    existingStatus &&
    !['canceled', 'incomplete_expired', 'unpaid'].includes(existingStatus) &&
    profileSnapshot?.cancel_at_period_end !== true
  ) {
    return NextResponse.json(
      {
        error: 'ALREADY_ACTIVE',
        message: 'Вече имаш активен абонамент по този план.',
      },
      { status: 409 }
    )
  }

  // Същото one-time до крайна дата — ако достъпът още не е изтекъл.
  if (
    config.mode === 'payment' &&
    currentlyActive &&
    existingPlanKey === plan
  ) {
    return NextResponse.json(
      {
        error: 'ALREADY_ACTIVE',
        message: 'Този план вече е активен до крайната дата.',
      },
      { status: 409 }
    )
  }

  const customerId = await ensureStripeCustomerId(
    stripe,
    user.id,
    user.email,
    existingCustomerId
  )

  const metadata = {
    planKey: plan,
    userId: user.id,
    userEmail: user.email,
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      client_reference_id: user.id,
      customer: customerId,
      metadata,
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
        ? {
            payment_intent_data: { metadata },
          }
        : {
            subscription_data: { metadata },
          }),
      success_url: `${BASE_URL}/dashboard/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/#pricing`,
    })

    // Ако user-ът е имал active recurring и купува друг recurring/one-time
    // (смяна НВО↔ДЗИ или upgrade към full), планираме стария да свърши в
    // края на платения период. Прилагаме това САМО след успешен checkout
    // чрез subscription metadata.supersedes, или веднага при recurring →
    // recurring. За простота тук: ако има active recurring и новият е
    // recurring за различен план или one-time, scheduled cancel on prior.
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

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
