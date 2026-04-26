import Link from 'next/link'
import { notFound } from 'next/navigation'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/shared/Badge'
import { BILLING_PLANS, isPlanKey } from '@/lib/billing/plans'
import { UserActions } from '@/components/admin/UserActions'

function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text text-base">{title}</h1>
      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
        <span className="text-xs font-bold text-primary">АД</span>
      </div>
    </header>
  )
}

function formatBgDate(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '—'
  const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function billingStatusVariant(status: string | null | undefined) {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'paid':
    case 'manual':
    case 'succeeded':
      return 'success'
    case 'past_due':
    case 'incomplete':
    case 'pending':
      return 'amber'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
    case 'manual_revoked':
    case 'failed':
      return 'danger'
    default:
      return 'neutral'
  }
}

export type PaymentInfo = {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  refunded: boolean
  amount_refunded: number
  description: string | null
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!profile) notFound()

  const { data: authUserData } = await admin.auth.admin.getUserById(id)
  const authUser = authUserData?.user ?? null

  // Stripe
  let stripeSubscription: Stripe.Subscription | null = null
  let payments: PaymentInfo[] = []
  let stripeError: string | null = null

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (stripeKey && (profile.stripe_customer_id || profile.stripe_subscription_id)) {
    const stripe = new Stripe(stripeKey)
    try {
      if (profile.stripe_subscription_id) {
        stripeSubscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      }
      if (profile.stripe_customer_id) {
        const list = await stripe.paymentIntents.list({
          customer: profile.stripe_customer_id,
          limit: 10,
        })
        payments = list.data.map((pi) => ({
          id: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          status: pi.status,
          created: pi.created,
          refunded:
            pi.status === 'succeeded' && (pi.amount_received ?? 0) > 0
              ? (pi.latest_charge && typeof pi.latest_charge !== 'string'
                  ? Boolean((pi.latest_charge as Stripe.Charge).refunded)
                  : false)
              : false,
          amount_refunded:
            pi.latest_charge && typeof pi.latest_charge !== 'string'
              ? (pi.latest_charge as Stripe.Charge).amount_refunded ?? 0
              : 0,
          description: pi.description ?? null,
        }))
      }
    } catch (err) {
      stripeError = err instanceof Error ? err.message : String(err)
    }
  }

  const banned = Boolean(
    authUser && (authUser as { banned_until?: string | null }).banned_until
      && new Date((authUser as { banned_until?: string | null }).banned_until!).getTime() > Date.now()
  )

  const billingPlanLabel = isPlanKey(profile.billing_plan_key ?? '')
    ? BILLING_PLANS[profile.billing_plan_key as keyof typeof BILLING_PLANS].name
    : profile.billing_plan_key ?? '—'

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Потребител" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <Link href="/admin/users" className="text-sm text-text-muted hover:text-text">
            ← Към списъка
          </Link>
        </div>

        {/* Identity */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-semibold text-text text-lg">{authUser?.email ?? '—'}</h2>
              <p className="text-sm text-text-muted">{profile.name ?? 'Без име'}</p>
              <p className="text-xs text-text-muted mt-1">ID: {profile.id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={profile.role === 'admin' ? 'primary' : 'neutral'}>
                Роля: {profile.role ?? 'user'}
              </Badge>
              <Badge variant={profile.plan === 'premium' ? 'amber' : 'neutral'}>
                {profile.plan === 'premium' ? 'Премиум' : 'Безплатен'}
              </Badge>
              {banned && <Badge variant="danger">Банат</Badge>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
            <div>
              <p className="text-xs text-text-muted">Последен вход</p>
              <p className="text-text">{formatBgDate(authUser?.last_sign_in_at ?? null)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Създаден</p>
              <p className="text-text">{formatBgDate(authUser?.created_at ?? null)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Клас</p>
              <p className="text-text">{profile.class ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Изпит</p>
              <p className="text-text">{profile.exam_path ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Billing snapshot */}
        <div className="card p-5">
          <h3 className="font-semibold text-text mb-4 text-sm">Billing snapshot (profiles)</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <BillingRow label="plan" value={profile.plan} />
            <BillingRow label="is_active" value={String(profile.is_active)} />
            <BillingRow label="plan_expires_at" value={formatBgDate(profile.plan_expires_at)} />
            <BillingRow label="billing_plan_key" value={billingPlanLabel} />
            <BillingRow label="billing_status" value={profile.billing_status} variant={billingStatusVariant(profile.billing_status)} />
            <BillingRow label="cancel_at_period_end" value={String(profile.cancel_at_period_end)} />
            <BillingRow label="cancel_at" value={formatBgDate(profile.cancel_at)} />
            <BillingRow label="current_period_end" value={formatBgDate(profile.current_period_end)} />
            <BillingRow label="last_payment_at" value={formatBgDate(profile.last_payment_at)} />
            <BillingRow label="last_payment_status" value={profile.last_payment_status} />
            <BillingRow label="stripe_customer_id" value={profile.stripe_customer_id} mono />
            <BillingRow label="stripe_subscription_id" value={profile.stripe_subscription_id} mono />
          </div>
          {profile.stripe_customer_id && (
            <p className="mt-4 text-xs text-text-muted">
              Stripe customer:{' '}
              <a
                href={`https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.includes('_test_') ? 'test/' : ''}customers/${profile.stripe_customer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.stripe_customer_id}
              </a>
            </p>
          )}
        </div>

        {/* Stripe subscription */}
        {stripeSubscription && (
          <div className="card p-5">
            <h3 className="font-semibold text-text mb-4 text-sm">Stripe subscription (live)</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <BillingRow label="status" value={stripeSubscription.status} variant={billingStatusVariant(stripeSubscription.status)} />
              <BillingRow
                label="current_period_end"
                value={formatBgDate(
                  stripeSubscription.items.data[0]?.current_period_end ?? null
                )}
              />
              <BillingRow label="cancel_at_period_end" value={String(stripeSubscription.cancel_at_period_end)} />
              <BillingRow label="cancel_at" value={formatBgDate(stripeSubscription.cancel_at)} />
            </div>
          </div>
        )}

        {stripeError && (
          <div className="card p-4 bg-danger-light/40 border-danger/30">
            <p className="text-sm text-danger">Stripe грешка: {stripeError}</p>
          </div>
        )}

        {/* Payments */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-text text-sm">Последни плащания (Stripe)</h3>
          </div>
          {payments.length === 0 ? (
            <div className="p-6 text-sm text-text-muted text-center">Няма намерени плащания.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Дата</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Сума</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Статус</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Refund</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">PaymentIntent</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm text-text-muted">{formatBgDate(p.created)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-text font-serif">
                        {formatAmount(p.amount, p.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={billingStatusVariant(p.status)}>{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {p.amount_refunded > 0 ? (
                          <Badge variant="danger">
                            {formatAmount(p.amount_refunded, p.currency)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted font-mono">{p.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <UserActions
          userId={profile.id}
          banned={banned}
          payments={payments}
          currentBilling={{
            plan: profile.plan,
            is_active: profile.is_active,
            plan_expires_at: profile.plan_expires_at,
            billing_plan_key: profile.billing_plan_key,
            billing_status: profile.billing_status,
          }}
        />
      </div>
    </div>
  )
}

function BillingRow({
  label,
  value,
  variant,
  mono,
}: {
  label: string
  value: string | null | undefined
  variant?: 'primary' | 'amber' | 'success' | 'danger' | 'neutral'
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      {variant && value ? (
        <Badge variant={variant}>{value}</Badge>
      ) : (
        <p className={`text-text ${mono ? 'font-mono text-xs break-all' : ''}`}>
          {value ?? '—'}
        </p>
      )}
    </div>
  )
}
