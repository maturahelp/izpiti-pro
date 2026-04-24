import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  BILLING_PLANS,
  buildPremiumProfilePatch,
  getOneTimePlanExpiry,
  isPlanKey,
  type PlanKey,
} from '@/lib/billing/plans'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET')
  }

  return process.env.STRIPE_WEBHOOK_SECRET
}

function getMetadataValue(metadata: Stripe.Metadata | null | undefined, key: string) {
  const value = metadata?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function getSubscriptionAccessState(status: Stripe.Subscription.Status) {
  return status === 'active' || status === 'trialing'
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const itemPeriodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((timestamp) => typeof timestamp === 'number' && Number.isFinite(timestamp))

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

async function updateProfileFromPlan(
  profileId: string,
  planKey: PlanKey,
  expiresAt: string | null,
  isActive = true
) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update(buildPremiumProfilePatch(planKey, expiresAt, isActive))
    .eq('id', profileId)

  if (error) {
    throw error
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const planKey = getMetadataValue(session.metadata, 'planKey')
  const userId = session.client_reference_id ?? getMetadataValue(session.metadata, 'userId')

  if (!planKey || !isPlanKey(planKey) || !userId) {
    console.error('[stripe webhook] checkout.session.completed missing metadata', {
      checkoutSessionId: session.id,
      planKey,
      userId,
    })
    return
  }

  if (BILLING_PLANS[planKey].mode === 'payment') {
    if (session.payment_status !== 'paid') {
      return
    }

    await updateProfileFromPlan(userId, planKey, getOneTimePlanExpiry(planKey), true)
    return
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

  if (!subscriptionId) {
    throw new Error(`Missing subscription id for checkout session ${session.id}`)
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await updateProfileFromPlan(
    userId,
    planKey,
    getSubscriptionPeriodEnd(subscription),
    getSubscriptionAccessState(subscription.status)
  )
}

async function handleInvoicePaid(
  stripe: Stripe,
  invoice: Stripe.Invoice
) {
  const subscriptionId =
    typeof invoice.parent?.subscription_details?.subscription === 'string'
      ? invoice.parent.subscription_details.subscription
      : invoice.parent?.subscription_details?.subscription?.id

  if (!subscriptionId) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const planKey = getMetadataValue(subscription.metadata, 'planKey')
  const userId = getMetadataValue(subscription.metadata, 'userId')

  if (!planKey || !isPlanKey(planKey) || !userId) {
    console.error('[stripe webhook] invoice.paid missing subscription metadata', {
      invoiceId: invoice.id,
      subscriptionId,
      planKey,
      userId,
    })
    return
  }

  await updateProfileFromPlan(
    userId,
    planKey,
    getSubscriptionPeriodEnd(subscription),
    getSubscriptionAccessState(subscription.status)
  )
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const planKey = getMetadataValue(subscription.metadata, 'planKey')
  const userId = getMetadataValue(subscription.metadata, 'userId')

  if (!planKey || !isPlanKey(planKey) || !userId) {
    console.error('[stripe webhook] subscription event missing metadata', {
      subscriptionId: subscription.id,
      planKey,
      userId,
    })
    return
  }

  await updateProfileFromPlan(
    userId,
    planKey,
    getSubscriptionPeriodEnd(subscription),
    getSubscriptionAccessState(subscription.status)
  )
}

export async function POST(req: NextRequest) {
  let stripe: Stripe

  try {
    stripe = getStripeClient()
  } catch (err) {
    console.error('[stripe webhook] stripe client setup failed', err)
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret())
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.paid':
        await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription)
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe webhook] handler failed', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
