import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BILLING_PLANS, isPlanKey, type PlanKey } from '@/lib/billing/plans'
import {
  applyBillingPatch,
  buildOneTimePaymentPatch,
  buildSubscriptionPatch,
  resolvePlanKeyFromSubscription,
  resolveUserIdFromCustomer,
  type BillingPatch,
} from '@/lib/billing/state'
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

function metadataString(
  metadata: Stripe.Metadata | null | undefined,
  key: string
): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Инициализира запис в stripe_events. Ако събитието вече е обработено,
 * връща false и пропускаме хендлъра. Реализирано чрез unique PK +
 * insert-or-ignore семантика.
 */
async function markEventReceived(eventId: string, eventType: string): Promise<boolean> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('stripe_events')
    .insert({ id: eventId, type: eventType })

  if (!error) return true

  // 23505 = unique_violation — вече сме обработили това събитие.
  const code = (error as { code?: string }).code
  if (code === '23505') return false

  // Друга грешка — позволяваме retry, но пишем в лог.
  console.error('[stripe webhook] failed to record event', { eventId, error })
  return true
}

async function markEventProcessed(eventId: string) {
  const admin = createAdminClient()
  await admin
    .from('stripe_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('id', eventId)
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const planKey = metadataString(session.metadata, 'planKey')
  const userId = session.client_reference_id ?? metadataString(session.metadata, 'userId')

  if (!planKey || !isPlanKey(planKey) || !userId) {
    console.error('[stripe webhook] checkout.session.completed missing metadata', {
      checkoutSessionId: session.id,
      planKey,
      userId,
    })
    return
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null

  // One-time payment → фиксирана крайна дата според плана.
  if (BILLING_PLANS[planKey].mode === 'payment') {
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return
    }

    const patch = buildOneTimePaymentPatch(planKey as PlanKey, customerId)
    await applyBillingPatch(userId, patch)
    return
  }

  // Recurring → retrieve-ваме subscription-а и го записваме цялостно.
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!subscriptionId) {
    throw new Error(`Missing subscription id for checkout session ${session.id}`)
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const patch = buildSubscriptionPatch(planKey as PlanKey, subscription, {
    lastPaymentAt: new Date().toISOString(),
    lastPaymentStatus: 'succeeded',
  })
  await applyBillingPatch(userId, patch)
}

async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.parent?.subscription_details?.subscription === 'string'
      ? invoice.parent.subscription_details.subscription
      : invoice.parent?.subscription_details?.subscription?.id

  if (!subscriptionId) {
    // Еднократни invoices (one-time checkout) се обработват от
    // checkout.session.completed.
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const planKey = resolvePlanKeyFromSubscription(subscription)
  let userId = metadataString(subscription.metadata, 'userId')

  if (!userId) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id ?? null
    if (customerId) {
      userId = await resolveUserIdFromCustomer(customerId)
    }
  }

  if (!planKey || !userId) {
    console.error('[stripe webhook] invoice.paid missing plan/user', {
      invoiceId: invoice.id,
      subscriptionId,
      planKey,
      userId,
    })
    return
  }

  const patch = buildSubscriptionPatch(planKey, subscription, {
    lastPaymentAt: new Date().toISOString(),
    lastPaymentStatus: 'succeeded',
  })
  await applyBillingPatch(userId, patch)
}

async function handleInvoicePaymentFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.parent?.subscription_details?.subscription === 'string'
      ? invoice.parent.subscription_details.subscription
      : invoice.parent?.subscription_details?.subscription?.id

  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const planKey = resolvePlanKeyFromSubscription(subscription)
  let userId = metadataString(subscription.metadata, 'userId')

  if (!userId) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id ?? null
    if (customerId) userId = await resolveUserIdFromCustomer(customerId)
  }

  if (!planKey || !userId) return

  // Не сваляме достъпа веднага: Stripe retry-ва плащания няколко пъти
  // преди subscription.status да стане unpaid/canceled. Даваме grace до
  // края на платения период (current_period_end от Stripe). Само
  // маркираме last_payment_status='failed' за UI.
  const patch = buildSubscriptionPatch(planKey, subscription, {
    lastPaymentAt: new Date().toISOString(),
    lastPaymentStatus: 'failed',
  })
  await applyBillingPatch(userId, patch)
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const planKey = resolvePlanKeyFromSubscription(subscription)
  let userId = metadataString(subscription.metadata, 'userId')

  if (!userId) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id ?? null
    if (customerId) userId = await resolveUserIdFromCustomer(customerId)
  }

  if (!planKey || !userId) {
    console.error('[stripe webhook] subscription event missing metadata', {
      subscriptionId: subscription.id,
      planKey,
      userId,
    })
    return
  }

  const patch: BillingPatch = buildSubscriptionPatch(planKey, subscription)
  await applyBillingPatch(userId, patch)
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

  const shouldProcess = await markEventReceived(event.id, event.type)
  if (!shouldProcess) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripe, event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription)
        break
      default:
        break
    }

    await markEventProcessed(event.id)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe webhook] handler failed', { eventId: event.id, err })
    // Не маркираме processed_at → Stripe ще retry-не.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
