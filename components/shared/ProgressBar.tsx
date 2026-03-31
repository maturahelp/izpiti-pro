import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  label?: string
  size?: 'sm' | 'md'
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  label,
  size = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
  }

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-text-muted">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-text">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full bg-primary transition-all duration-500', barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
