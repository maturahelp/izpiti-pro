import type { User } from '@supabase/supabase-js'
import { isPlanKey } from '@/lib/billing/plans'
import { hasActivePremium } from '@/lib/subscription-access'
import {
  EMAIL_AUTOMATION_TEMPLATES,
  type EmailAutomationPayloadMap,
  type EmailAutomationTemplateKey,
} from '@/lib/email-automation/jobs'
import { sendResendEmail } from '@/lib/email-automation/resend'
import { renderEmailAutomationTemplate } from '@/lib/email-automation/templates'
import { createAdminClient } from '@/lib/supabase/admin'

type EmailAutomationJobRow = {
  id: string
  user_id: string
  template_key: EmailAutomationTemplateKey
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'skipped' | 'canceled'
  email: string | null
  payload: EmailAutomationPayloadMap[EmailAutomationTemplateKey]
  attempts: number
  scheduled_for: string
}

type ProfileSnapshot = {
  id: string
  name: string | null
  class: string | null
  role: string | null
  plan: string | null
  is_active: boolean | null
  plan_expires_at: string | null
  billing_plan_key: string | null
}

type ProcessEmailAutomationJobsResult = {
  processed: number
  sent: number
  skipped: number
  failed: number
}

const RETRY_DELAY_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 3
const STALE_PROCESSING_AFTER_MS = 30 * 60 * 1000

function isTemplateKey(value: string): value is EmailAutomationTemplateKey {
  return EMAIL_AUTOMATION_TEMPLATES.includes(
    value as EmailAutomationTemplateKey
  )
}

async function getDueJobs(limit: number) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('email_automation_jobs')
    .select('id, user_id, template_key, status, email, payload, attempts, scheduled_for')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(limit)

  if (error) throw error

  return (data ?? [])
    .filter((row): row is EmailAutomationJobRow => isTemplateKey(row.template_key))
}

async function claimJob(job: EmailAutomationJobRow) {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()
  const { data, error } = await admin
    .from('email_automation_jobs')
    .update({
      status: 'processing',
      attempts: job.attempts + 1,
      processing_started_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', job.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) throw error
  return Boolean(data?.id)
}

async function getAuthUserById(userId: string): Promise<User | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.getUserById(userId)
  if (error) throw error
  return data.user ?? null
}

async function getProfileById(userId: string): Promise<ProfileSnapshot | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, name, class, role, plan, is_active, plan_expires_at, billing_plan_key')
    .eq('id', userId)
    .maybeSingle<ProfileSnapshot>()

  if (error) throw error
  return data ?? null
}

async function getLatestMarketingConsent(userId: string): Promise<boolean | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('consent_logs')
    .select('marketing_emails')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ marketing_emails: boolean }>()

  if (error) throw error
  return typeof data?.marketing_emails === 'boolean'
    ? data.marketing_emails
    : null
}

async function markJobSent(jobId: string, providerMessageId: string | null) {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()
  const { error } = await admin
    .from('email_automation_jobs')
    .update({
      status: 'sent',
      sent_at: nowIso,
      provider_message_id: providerMessageId,
      processing_started_at: null,
      updated_at: nowIso,
      last_error: null,
    })
    .eq('id', jobId)

  if (error) throw error
}

async function markJobSkipped(jobId: string, reason: string) {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()
  const { error } = await admin
    .from('email_automation_jobs')
    .update({
      status: 'skipped',
      processing_started_at: null,
      updated_at: nowIso,
      last_error: reason,
    })
    .eq('id', jobId)

  if (error) throw error
}

async function markJobFailed(job: EmailAutomationJobRow, errorMessage: string) {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()
  const shouldRetry = job.attempts + 1 < MAX_ATTEMPTS

  const patch = shouldRetry
    ? {
        status: 'pending',
        scheduled_for: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
        processing_started_at: null,
        updated_at: nowIso,
        last_error: errorMessage,
      }
    : {
        status: 'failed',
        processing_started_at: null,
        updated_at: nowIso,
        last_error: errorMessage,
      }

  const { error } = await admin
    .from('email_automation_jobs')
    .update(patch)
    .eq('id', job.id)

  if (error) throw error
}

async function releaseStaleProcessingJobs() {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()
  const staleBeforeIso = new Date(
    Date.now() - STALE_PROCESSING_AFTER_MS
  ).toISOString()

  const { error: retryError } = await admin
    .from('email_automation_jobs')
    .update({
      status: 'pending',
      scheduled_for: nowIso,
      processing_started_at: null,
      updated_at: nowIso,
      last_error: 'released_stale_processing_job',
    })
    .eq('status', 'processing')
    .lt('processing_started_at', staleBeforeIso)
    .lt('attempts', MAX_ATTEMPTS)

  if (retryError) throw retryError

  const { error: failError } = await admin
    .from('email_automation_jobs')
    .update({
      status: 'failed',
      processing_started_at: null,
      updated_at: nowIso,
      last_error: 'stale_processing_job_max_attempts_reached',
    })
    .eq('status', 'processing')
    .lt('processing_started_at', staleBeforeIso)
    .gte('attempts', MAX_ATTEMPTS)

  if (failError) throw failError
}

function getPayloadPlanName(job: EmailAutomationJobRow) {
  const payload = job.payload as Partial<EmailAutomationPayloadMap['purchase_welcome']>
  return typeof payload.planName === 'string' ? payload.planName : null
}

function getPayloadAccessEndsAt(profile: ProfileSnapshot | null) {
  return profile?.plan_expires_at ?? null
}

function getProfilePlanKey(profile: ProfileSnapshot | null) {
  const value = profile?.billing_plan_key
  return typeof value === 'string' && isPlanKey(value) ? value : null
}

export async function processEmailAutomationJobs(
  limit = 20
): Promise<ProcessEmailAutomationJobsResult> {
  await releaseStaleProcessingJobs()

  const dueJobs = await getDueJobs(limit)
  let processed = 0
  let sent = 0
  let skipped = 0
  let failed = 0

  for (const job of dueJobs) {
    const claimed = await claimJob(job)
    if (!claimed) continue

    processed += 1

    try {
      const [profile, authUser] = await Promise.all([
        getProfileById(job.user_id),
        getAuthUserById(job.user_id),
      ])

      const email = (job.email ?? authUser?.email ?? '').trim().toLowerCase()
      if (!email) {
        await markJobSkipped(job.id, 'missing_recipient_email')
        skipped += 1
        continue
      }

      if (job.template_key === 'grade12_no_purchase_nudge') {
        if (!authUser?.email_confirmed_at) {
          await markJobSkipped(job.id, 'email_not_confirmed')
          skipped += 1
          continue
        }

        if (!profile || profile.class !== '12') {
          await markJobSkipped(job.id, 'not_grade12_anymore')
          skipped += 1
          continue
        }

        if (profile.role === 'admin') {
          await markJobSkipped(job.id, 'admin_profile')
          skipped += 1
          continue
        }

        if (hasActivePremium(profile)) {
          await markJobSkipped(job.id, 'already_premium')
          skipped += 1
          continue
        }

        const marketingConsent = await getLatestMarketingConsent(job.user_id)
        if (marketingConsent === false) {
          await markJobSkipped(job.id, 'marketing_opt_out')
          skipped += 1
          continue
        }
      }

      if (job.template_key === 'nvo7_urgency_nudge') {
        if (!authUser?.email_confirmed_at) {
          await markJobSkipped(job.id, 'email_not_confirmed')
          skipped += 1
          continue
        }

        if (!profile || profile.class !== '7') {
          await markJobSkipped(job.id, 'not_grade7_anymore')
          skipped += 1
          continue
        }

        if (profile.role === 'admin') {
          await markJobSkipped(job.id, 'admin_profile')
          skipped += 1
          continue
        }

        if (hasActivePremium(profile)) {
          await markJobSkipped(job.id, 'already_premium')
          skipped += 1
          continue
        }

        const marketingConsent = await getLatestMarketingConsent(job.user_id)
        if (marketingConsent === false) {
          await markJobSkipped(job.id, 'marketing_opt_out')
          skipped += 1
          continue
        }
      }

      const rendered = renderEmailAutomationTemplate({
        templateKey: job.template_key,
        recipientEmail: email,
        recipientName: profile?.name ?? null,
        planKey: getProfilePlanKey(profile),
        planName: getPayloadPlanName(job),
        accessEndsAt: getPayloadAccessEndsAt(profile),
      })

      const result = await sendResendEmail({
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        idempotencyKey: job.id,
      })

      await markJobSent(job.id, result.id)
      sent += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await markJobFailed(job, message)
      failed += 1
    }
  }

  return { processed, sent, skipped, failed }
}
