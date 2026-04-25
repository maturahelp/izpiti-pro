import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAdmin } from '@/lib/admin/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({})) as {
    paymentIntentId?: string
    reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent'
  }

  if (!body.paymentIntentId) {
    return NextResponse.json({ error: 'MISSING_PAYMENT_INTENT_ID' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
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
