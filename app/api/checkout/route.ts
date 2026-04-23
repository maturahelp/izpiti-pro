import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BILLING_PLANS, isPlanKey, type PlanKey } from '@/lib/billing/plans'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://izpiti.pro'

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
  const metadata = {
    planKey: plan,
    userId: user.id,
    userEmail: user.email,
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      client_reference_id: user.id,
      customer_email: user.email,
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
            customer_creation: 'always',
            payment_intent_data: { metadata },
          }
        : {
            subscription_data: { metadata },
          }),
      success_url: `${BASE_URL}/dashboard/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/#pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
