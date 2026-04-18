import Link from 'next/link'
import { LEGAL_PROVIDER, LEGAL_SUPPORT_EMAIL, LEGAL_UPDATED_AT_BG } from '@/lib/legal-consent'

interface LegalPageShellProps {
  title: string
  children: React.ReactNode
}

interface LegalSectionProps {
  title: string
  children: React.ReactNode
}

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl border border-[#E2E8F0] bg-white px-5 py-7 shadow-[4px_4px_0_rgba(0,0,0,0.06)] sm:px-8 sm:py-9">
        <Link href="/" className="text-[13px] font-semibold text-primary hover:underline">
          Към началото
        </Link>

        <header className="mt-5 border-b border-[#E2E8F0] pb-5">
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] text-text sm:text-[2.5rem]">
            {title}
          </h1>
          <div className="mt-4 space-y-1 text-[13px] text-text-muted">
            <p>
              <strong className="text-text">Последна актуализация:</strong> {LEGAL_UPDATED_AT_BG}
            </p>
            <p>
              <strong className="text-text">Доставчик:</strong> {LEGAL_PROVIDER}
            </p>
            <p>
              <strong className="text-text">Имейл:</strong>{' '}
              <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="font-semibold text-primary hover:underline">
                {LEGAL_SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </header>

        <div className="mt-7 space-y-7 text-[15px] leading-7 text-text-muted">
          {children}
        </div>
      </article>
    </main>
  )
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-[20px] font-bold tracking-[-0.02em] text-text">{title}</h2>
      {children}
    </section>
  )
}

export function LegalBulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
