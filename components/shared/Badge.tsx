import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'amber' | 'success' | 'danger' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    primary: 'bg-primary-light text-primary',
    amber: 'bg-amber-light text-amber',
    success: 'bg-success-light text-success',
    danger: 'bg-danger-light text-danger',
    neutral: 'bg-gray-100 text-text-muted',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
