import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: { value: number; positive?: boolean }
  icon?: React.ReactNode
  accent?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  subtext,
  trend,
  icon,
  accent = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'card p-5 flex flex-col gap-3',
        accent && 'border-primary/20 bg-primary-light',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('text-xs font-semibold uppercase tracking-wider', accent ? 'text-primary' : 'text-text-muted')}>
          {label}
        </span>
        {icon && (
          <span className={cn('text-text-muted', accent && 'text-primary')}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={cn('text-3xl font-bold font-serif', accent ? 'text-primary' : 'text-text')}>
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full mb-1',
              trend.positive !== false
                ? 'bg-success-light text-success'
                : 'bg-danger-light text-danger'
            )}
          >
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subtext && (
        <p className={cn('text-xs', accent ? 'text-primary/70' : 'text-text-muted')}>
          {subtext}
        </p>
      )}
    </div>
  )
}
