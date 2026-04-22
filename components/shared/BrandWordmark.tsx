import { cn } from '@/lib/utils'

interface BrandWordmarkProps {
  className?: string
  maturaClassName?: string
  helpClassName?: string
}

export function BrandWordmark({
  className,
  maturaClassName,
  helpClassName,
}: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-extrabold leading-none tracking-[-0.04em]',
        className
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <span className={cn('text-[#0F172A]', maturaClassName)}>Matura</span>
      <span className={cn('text-[#5899E2]', helpClassName)}>Help</span>
    </span>
  )
}
