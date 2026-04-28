import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BILLING_PLANS, isPlanKey } from '@/lib/billing/plans'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://izpiti.pro'

/**
 * GET /api/checkout/redirect?plan=<planKey>
 *
 * Called after registration/login to drop the student directly into Stripe checkout
 * for the plan they chose before being prompted to register.
 *
 * Side-effect policy: creates/reuses a Stripe customer (idempotent) and opens a
 * checkout session. Intentionally does NOT cancel any existing subscription here —
 * that logic belongs in the POST /api/checkout flow (user-initiated upgrade) or the
 * Stripe webhook (payment confirmed).
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    const redirectTo = encodeURIComponent(`/api/checkout/redirect?plan=${plan}`)
    return NextResponse.redirect(new URL(`/register?redirectTo=${redirectTo}`, BASE_URL))
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const config = BILLING_PLANS[plan]

  // Reuse existing Stripe customer or create one (idempotent).
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  let customerId = profile?.stripe_customer_id ?? null
  if (!customerId) {
    const search = await stripe.customers.list({ email: user.email, limit: 1 })
    customerId = search.data[0]?.id ?? null
    if (!customerId) {
      const created = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
      customerId = created.id
    }
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  const metadata = { planKey: plan, userId: user.id, userEmail: user.email }

  try {
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

    if (!session.url) {
      return NextResponse.redirect(new URL('/#pricing', BASE_URL))
    }

    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error('[checkout/redirect] Stripe error:', err)
    return NextResponse.redirect(new URL('/#pricing', BASE_URL))
  }
}
