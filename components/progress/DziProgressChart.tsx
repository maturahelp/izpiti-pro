'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchDziProgress, type DziProgressData } from '@/lib/progress'
import { getScoreColor } from '@/lib/utils'

const WIDTH = 680
const HEIGHT = 240
const PADDING = { top: 20, right: 24, bottom: 36, left: 40 }

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

export function DziProgressChart() {
  const [data, setData] = useState<DziProgressData | null>(null)

  useEffect(() => {
    fetchDziProgress().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="card p-5">
        <h2 className="font-semibold text-text mb-4">Прогрес на ДЗИ тестовете</h2>
        <div className="flex items-center justify-center h-48 text-text-muted text-sm">
          Зареждане...
        </div>
      </div>
    )
  }

  if (data.attempts.length === 0) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-semibold text-text">Прогрес на ДЗИ тестовете</h2>
          <span className="text-xs text-text-muted">
            Максимум {data.maxScore}% · Успех от {data.minPassScore}%
          </span>
        </div>
        <div className="rounded-lg bg-gray-50 border border-border p-6 text-center">
          <p className="text-sm text-text-muted mb-4">
            Все още не си решил ДЗИ тест. Започни първия си тест, за да видиш прогреса си тук.
          </p>
          <Link href="/dashboard/tests" className="btn-primary inline-flex">
            Към ДЗИ тестовете
          </Link>
        </div>
      </div>
    )
  }

  const attempts = data.attempts
  const innerW = WIDTH - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom

  const xFor = (i: number) =>
    attempts.length === 1
      ? PADDING.left + innerW / 2
      : PADDING.left + (i / (attempts.length - 1)) * innerW
  const yFor = (score: number) =>
    PADDING.top + innerH - (score / data.maxScore) * innerH

  const linePath = attempts
    .map((a, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(a.score).toFixed(1)}`)
    .join(' ')

  const yTicks = [0, 25, 50, 75, 100]
  const passY = yFor(data.minPassScore)
  const maxY = yFor(data.maxScore)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold text-text">Прогрес на ДЗИ тестовете</h2>
        <div className="flex items-center gap-4 text-[11px] text-text-muted flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary rounded-full" />
            Твой резултат
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-success" />
            Максимум ({data.maxScore}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-danger" />
            Успех ({data.minPassScore}%)
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto min-w-[480px]"
          role="img"
          aria-label="Графика на прогреса на ДЗИ тестовете"
        >
          {/* Y grid + labels */}
          {yTicks.map((t) => {
            const y = yFor(t)
            return (
              <g key={t}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 6}
                  y={y + 3}
                  fontSize={10}
                  fill="#64748B"
                  textAnchor="end"
                >
                  {t}%
                </text>
              </g>
            )
          })}

          {/* Max score dashed line */}
          <line
            x1={PADDING.left}
            y1={maxY}
            x2={WIDTH - PADDING.right}
            y2={maxY}
            stroke="#059669"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Pass score dashed line */}
          <line
            x1={PADDING.left}
            y1={passY}
            x2={WIDTH - PADDING.right}
            y2={passY}
            stroke="#DC2626"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Score line */}
          {attempts.length > 1 && (
            <path d={linePath} fill="none" stroke="#2F4E85" strokeWidth={2} />
          )}

          {/* Data points */}
          {attempts.map((a, i) => {
            const cx = xFor(i)
            const cy = yFor(a.score)
            const color =
              a.score >= 80 ? '#059669' : a.score >= data.minPassScore ? '#D97706' : '#DC2626'
            return (
              <g key={a.id}>
                <circle cx={cx} cy={cy} r={5} fill="#fff" stroke={color} strokeWidth={2}>
                  <title>
                    {a.testName} — {a.score}% ({formatDate(a.attemptedAt)})
                  </title>
                </circle>
              </g>
            )
          })}

          {/* X labels (show first, last, and every Nth to avoid crowding) */}
          {attempts.map((a, i) => {
            const step = Math.max(1, Math.ceil(attempts.length / 6))
            const showLabel = i === 0 || i === attempts.length - 1 || i % step === 0
            if (!showLabel) return null
            return (
              <text
                key={`x-${a.id}`}
                x={xFor(i)}
                y={HEIGHT - PADDING.bottom + 16}
                fontSize={10}
                fill="#64748B"
                textAnchor="middle"
              >
                {formatDate(a.attemptedAt)}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
        <div>
          <p className="text-[11px] text-text-muted mb-1">Последен резултат</p>
          <p className={`text-lg font-bold font-serif ${getScoreColor(data.lastScore ?? 0)}`}>
            {data.lastScore !== null ? `${data.lastScore}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted mb-1">Най-висок резултат</p>
          <p className={`text-lg font-bold font-serif ${getScoreColor(data.bestScore ?? 0)}`}>
            {data.bestScore !== null ? `${data.bestScore}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted mb-1">Среден резултат</p>
          <p className={`text-lg font-bold font-serif ${getScoreColor(data.avgScore ?? 0)}`}>
            {data.avgScore !== null ? `${data.avgScore}%` : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
