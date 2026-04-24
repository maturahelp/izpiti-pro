import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * Обратно на /api/stripe/cancel: ако абонаментът още не е изтекъл и е
 * маркиран cancel_at_period_end=true, разрешаваме на user-а да го
 * възобнови без нов checkout.
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
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .maybeSingle<{ stripe_subscription_id: string | null }>()

  const subscriptionId = profile?.stripe_subscription_id ?? null
  if (!subscriptionId) {
    return NextResponse.json(
      { error: 'NO_SUBSCRIPTION' },
      { status: 404 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    if (subscription.status === 'canceled') {
      return NextResponse.json(
        {
          error: 'ALREADY_CANCELED',
          message: 'Абонаментът вече е приключил. Моля, избери нов план.',
        },
        { status: 409 }
      )
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    await admin
      .from('profiles')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[billing resume] failed', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
