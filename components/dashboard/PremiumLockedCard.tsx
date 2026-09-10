import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'

/**
 * Locked state rendered by server-gated material pages when the visitor has
 * no entitlement for the requested item. Same markup/tone as the NVO rich
 * summary page so every premium gate looks identical.
 */
export function PremiumLockedCard({
  title,
  heading,
  description,
}: {
  title: string
  heading: string
  description: string
}) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title={title} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white border border-border p-6 md:p-8 shadow-sm text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Премиум съдържание</p>
          <h1 className="text-xl font-bold text-[#1B2845] mb-3">{heading}</h1>
          <p className="text-text-muted mb-6">{description}</p>
          <Link
            href="/dashboard/subscription"
            className="inline-block rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 transition-colors"
          >
            Виж плановете
          </Link>
          <div>
            <Link href="/dashboard/materials" className="mt-4 inline-block text-sm text-primary hover:underline">
              ← Назад към материалите
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
