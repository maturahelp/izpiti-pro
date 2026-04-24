import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={BRAND_LOGO_ALT}
      className={cn('h-8 w-8 shrink-0 object-contain', className)}
    />
  )
}
