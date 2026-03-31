import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PremiumLockProps {
  className?: string
  message?: string
  compact?: boolean
}

export function PremiumLock({
  className,
  message = 'Тази функция е достъпна само за Премиум абонати',
  compact = false,
}: PremiumLockProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <LockIcon size={12} />
        <span className="text-xs font-semibold text-amber">Премиум</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'absolute inset-0 bg-white/92 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl z-10 gap-3',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-amber-light flex items-center justify-center">
        <LockIcon size={18} className="text-amber" />
      </div>
      <div className="text-center px-4">
        <p className="text-sm font-semibold text-text mb-1">Премиум съдържание</p>
        <p className="text-xs text-text-muted">{message}</p>
      </div>
      <Link
        href="/subscription"
        className="btn-primary text-xs px-4 py-2"
      >
        Виж плановете
      </Link>
    </div>
  )
}

function LockIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
