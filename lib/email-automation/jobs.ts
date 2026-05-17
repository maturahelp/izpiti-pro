import type { PlanKey } from '@/lib/billing/plans'
import { BILLING_PLANS } from '@/lib/billing/plans'
import { createAdminClient } from '@/lib/supabase/admin'

export const EMAIL_AUTOMATION_TEMPLATES = [
  'purchase_welcome',
  'purchase_feedback',
  'grade12_no_purchase_nudge',
] as const

export type EmailAutomationTemplateKey =
  (typeof EMAIL_AUTOMATION_TEMPLATES)[number]

type PurchaseEmailPayload = {
  planKey: PlanKey
  planName: string
  purchaseReference: string
  purchasedAt: string
}

type Grade12NoPurchasePayload = {
  source: 'profiles-trigger'
  class_snapshot: '12'
}

export type EmailAutomationPayloadMap = {
  purchase_welcome: PurchaseEmailPayload
  purchase_feedback: PurchaseEmailPayload
  grade12_no_purchase_nudge: Grade12NoPurchasePayload
}

export type QueueEmailAutomationJobInput<
  TTemplate extends EmailAutomationTemplateKey,
> = {
  userId: string
  templateKey: TTemplate
  scheduledFor: string
  dedupeKey: string
  payload: EmailAutomationPayloadMap[TTemplate]
  email?: string | null
}

function isDuplicateInsert(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: string }).code)
    : ''
  return code === '23505'
}

export async function queueEmailAutomationJob<
  TTemplate extends EmailAutomationTemplateKey,
>(input: QueueEmailAutomationJobInput<TTemplate>) {
  const admin = createAdminClient()
  const { error } = await admin.from('email_automation_jobs').insert({
    user_id: input.userId,
    template_key: input.templateKey,
    status: 'pending',
    dedupe_key: input.dedupeKey,
    email: input.email ?? null,
    payload: input.payload,
    scheduled_for: input.scheduledFor,
    updated_at: new Date().toISOString(),
  })

  if (error && !isDuplicateInsert(error)) {
    throw error
  }
}

export async function cancelPendingEmailAutomationJobs(
  userId: string,
  templateKeys: EmailAutomationTemplateKey[]
) {
  if (templateKeys.length === 0) return

  const admin = createAdminClient()
  const nowIso = new Date().toISOString()
  const { error } = await admin
    .from('email_automation_jobs')
    .update({
      status: 'canceled',
      canceled_at: nowIso,
      updated_at: nowIso,
    })
    .eq('user_id', userId)
    .in('template_key', templateKeys)
    .in('status', ['pending', 'processing'])

  if (error) throw error
}

export async function schedulePurchaseEmailAutomations(input: {
  userId: string
  email?: string | null
  planKey: PlanKey
  purchaseReference: string
  purchasedAt?: string
}) {
  const purchasedAt = input.purchasedAt ?? new Date().toISOString()
  const planName = BILLING_PLANS[input.planKey].name
  const payload: PurchaseEmailPayload = {
    planKey: input.planKey,
    planName,
    purchaseReference: input.purchaseReference,
    purchasedAt,
  }

  await cancelPendingEmailAutomationJobs(input.userId, [
    'grade12_no_purchase_nudge',
  ])

  await queueEmailAutomationJob({
    userId: input.userId,
    email: input.email ?? null,
    templateKey: 'purchase_welcome',
    scheduledFor: purchasedAt,
    dedupeKey: `purchase-welcome:${input.purchaseReference}`,
    payload,
  })

  await queueEmailAutomationJob({
    userId: input.userId,
    email: input.email ?? null,
    templateKey: 'purchase_feedback',
    scheduledFor: new Date(
      new Date(purchasedAt).getTime() + 24 * 60 * 60 * 1000
    ).toISOString(),
    dedupeKey: `purchase-feedback:${input.purchaseReference}`,
    payload,
  })
}
