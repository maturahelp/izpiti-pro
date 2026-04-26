'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BILLING_PLANS, type PlanKey } from '@/lib/billing/plans'
import { Badge } from '@/components/shared/Badge'
import type { PaymentInfo } from '@/app/(admin)/admin/users/[id]/page'

type Billing = {
  plan: string | null
  is_active: boolean | null
  plan_expires_at: string | null
  billing_plan_key: string | null
  billing_status: string | null
}

type Props = {
  userId: string
  banned: boolean
  currentBilling: Billing
  payments: PaymentInfo[]
}

export function UserActions({ userId, banned, currentBilling, payments }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Grant premium modal state
  const [showGrant, setShowGrant] = useState(false)
  const [planKey, setPlanKey] = useState<PlanKey | ''>('')
  const [customExpiry, setCustomExpiry] = useState('')

  // Refund modal
  const [refundFor, setRefundFor] = useState<PaymentInfo | null>(null)
  const [refundReason, setRefundReason] = useState<'requested_by_customer' | 'duplicate' | 'fraudulent'>('requested_by_customer')

  async function call(path: string, body: unknown, op: string, msg: string) {
    setLoading(op)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Грешка (${res.status})`)
      }
      setSuccess(msg)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(null)
    }
  }

  async function handleGrant() {
    if (!planKey && !customExpiry) {
      setError('Избери план или въведи дата.')
      return
    }
    await call(
      `/api/admin/users/${userId}/grant-premium`,
      { planKey: planKey || null, customExpiry: customExpiry || undefined },
      'grant',
      'Премиум е даден.'
    )
    setShowGrant(false)
    setPlanKey('')
    setCustomExpiry('')
  }

  async function handleRevoke() {
    if (!confirm('Сигурен ли си, че искаш да махнеш премиум достъпа?')) return
    await call(`/api/admin/users/${userId}/revoke-premium`, {}, 'revoke', 'Премиум е премахнат.')
  }

  async function handleBan() {
    const next = !banned
    if (!confirm(next ? 'Да баним ли потребителя?' : 'Да разбаним ли потребителя?')) return
    await call(`/api/admin/users/${userId}/ban`, { ban: next }, 'ban', next ? 'Банат.' : 'Разбанат.')
  }

  async function handleRefund() {
    if (!refundFor) return
    await call(
      `/api/admin/users/${userId}/refund`,
      { paymentIntentId: refundFor.id, reason: refundReason },
      'refund',
      'Refund е направен.'
    )
    setRefundFor(null)
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-text mb-4 text-sm">Действия</h3>

      <div className="mb-4 text-xs text-text-muted">
        Текущо:{' '}
        <Badge variant={currentBilling.plan === 'premium' ? 'amber' : 'neutral'}>
          {currentBilling.plan === 'premium' ? 'Премиум' : 'Безплатен'}
        </Badge>{' '}
        {currentBilling.billing_status && (
          <Badge variant="neutral">{currentBilling.billing_status}</Badge>
        )}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-danger-light/40 border border-danger/30 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-success-light/40 border border-success/30 text-sm text-success">
          {success}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button"
          className="btn-primary"
          disabled={loading !== null}
          onClick={() => setShowGrant((v) => !v)}
        >
          Дай премиум
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading !== null}
          onClick={handleRevoke}
        >
          {loading === 'revoke' ? 'Махам...' : 'Махни премиум'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading !== null}
          onClick={handleBan}
        >
          {loading === 'ban' ? '...' : banned ? 'Разбани' : 'Бан'}
        </button>
      </div>

      {showGrant && (
        <div className="border border-border rounded-xl p-4 mb-5 space-y-3 bg-bg">
          <h4 className="text-sm font-semibold text-text">Дай премиум ръчно</h4>
          <div>
            <label className="text-xs text-text-muted block mb-1">План</label>
            <select
              className="input-field"
              value={planKey}
              onChange={(e) => setPlanKey(e.target.value as PlanKey | '')}
            >
              <option value="">— без план (само custom expiry) —</option>
              {(Object.keys(BILLING_PLANS) as PlanKey[]).map((k) => (
                <option key={k} value={k}>
                  {BILLING_PLANS[k].name} ({k})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">
              Custom expiry (по избор — иначе ще се ползва default-ът на плана)
            </label>
            <input
              type="date"
              className="input-field"
              value={customExpiry}
              onChange={(e) => setCustomExpiry(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={handleGrant}
              disabled={loading === 'grant'}
            >
              {loading === 'grant' ? 'Записвам...' : 'Потвърди'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowGrant(false)}
              disabled={loading === 'grant'}
            >
              Откажи
            </button>
          </div>
        </div>
      )}

      {/* Refunds */}
      <h4 className="text-sm font-semibold text-text mb-2">Refund на плащане</h4>
      {payments.length === 0 ? (
        <p className="text-sm text-text-muted">Няма плащания за refund.</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => {
            const refundable = p.status === 'succeeded' && p.amount_refunded < p.amount
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border"
              >
                <div className="text-xs">
                  <p className="font-mono text-text-muted">{p.id}</p>
                  <p className="text-text">
                    {(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()} · {p.status}
                    {p.amount_refunded > 0 && ` · refunded ${(p.amount_refunded / 100).toFixed(2)}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  disabled={!refundable || loading !== null}
                  onClick={() => setRefundFor(p)}
                >
                  Refund
                </button>
              </div>
            )
          })}
        </div>
      )}

      {refundFor && (
        <div className="border border-border rounded-xl p-4 mt-4 space-y-3 bg-bg">
          <h4 className="text-sm font-semibold text-text">Refund {refundFor.id}</h4>
          <div>
            <label className="text-xs text-text-muted block mb-1">Причина</label>
            <select
              className="input-field"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value as typeof refundReason)}
            >
              <option value="requested_by_customer">requested_by_customer</option>
              <option value="duplicate">duplicate</option>
              <option value="fraudulent">fraudulent</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={handleRefund}
              disabled={loading === 'refund'}
            >
              {loading === 'refund' ? 'Refund-вам...' : 'Потвърди refund'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setRefundFor(null)}
              disabled={loading === 'refund'}
            >
              Откажи
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
