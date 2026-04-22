import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

type PlanKey = 'nvo-monthly' | 'nvo-full' | 'dzi-monthly' | 'dzi-full' | 'family'

const PLANS: Record<PlanKey, { name: string; amount: number; currency: string; mode: 'payment' | 'subscription' }> = {
  'nvo-monthly': {
    name: 'НВО Месечен план',
    amount: 3000,
    currency: 'eur',
    mode: 'subscription',
  },
  'nvo-full': {
    name: 'НВО до края на изпитите',
    amount: 3000,
    currency: 'eur',
    mode: 'payment',
  },
  'dzi-monthly': {
    name: 'ДЗИ Месечен план',
    amount: 3000,
    currency: 'eur',
    mode: 'subscription',
  },
  'dzi-full': {
    name: 'ДЗИ до края на матурите',
    amount: 1999,
    currency: 'eur',
    mode: 'payment',
  },
  family: {
    name: 'Семеен план — НВО + ДЗИ',
    amount: 3999,
    currency: 'eur',
    mode: 'payment',
  },
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://izpiti.pro'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const { plan } = (await req.json()) as { plan: PlanKey }

  const config = PLANS[plan]
  if (!config) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  try {
  const session = await stripe.checkout.sessions.create({
    mode: config.mode,
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
    success_url: `${BASE_URL}/dashboard?checkout=success`,
    cancel_url: `${BASE_URL}/#pricing`,
  })

  return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
