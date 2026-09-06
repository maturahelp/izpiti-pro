import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 500 })
  }

  const { id: userId } = await params

  const body = await req.json().catch(() => ({})) as {
    paymentIntentId?: string
    reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent'
  }

  if (!body.paymentIntentId) {
    return NextResponse.json({ error: 'MISSING_PAYMENT_INTENT_ID' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle<{ stripe_customer_id: string | null }>()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId)
    const piCustomerId =
      typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id

    if (!profile.stripe_customer_id || piCustomerId !== profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'PAYMENT_INTENT_USER_MISMATCH' },
        { status: 409 }
      )
    }

    const refund = await stripe.refunds.create({
      payment_intent: body.paymentIntentId,
      reason: body.reason ?? 'requested_by_customer',
    })
    return NextResponse.json({ ok: true, refund: { id: refund.id, status: refund.status } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
