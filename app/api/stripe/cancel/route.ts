import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * In-app cancel: маркира subscription-а като cancel_at_period_end=true,
 * така че достъпът остава до края на текущия платен период.
 * Webhook-ът (customer.subscription.updated) ще актуализира profile-а.
 */
export async function POST(_req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_subscription_id, billing_status')
    .eq('id', user.id)
    .maybeSingle<{ stripe_subscription_id: string | null; billing_status: string | null }>()

  const subscriptionId = profile?.stripe_subscription_id ?? null
  if (!subscriptionId) {
    return NextResponse.json(
      { error: 'NO_SUBSCRIPTION', message: 'Няма активен абонамент за отмяна.' },
      { status: 404 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    if (subscription.status === 'canceled') {
      return NextResponse.json({ ok: true, already: true })
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Оптимистично маркираме в profile — webhook-ът ще затвърди.
    await admin
      .from('profiles')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({
      ok: true,
      cancel_at:
        typeof updated.cancel_at === 'number'
          ? new Date(updated.cancel_at * 1000).toISOString()
          : null,
    })
  } catch (err) {
    console.error('[billing cancel] failed', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
