import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { PriemBalCalculator } from '@/components/marketing/PriemBalCalculator'

export const metadata: Metadata = {
  title: 'Калкулатор за минимален бал след 7. клас 2025 — MaturaHelp',
  description:
    'Изчисли бала си след 7. клас и виж в кои паралелки в София-град можеш да влезеш според данните на РУО за 2025 г.',
  alternates: { canonical: '/kalkulator-bal' },
  openGraph: {
    title: 'Калкулатор за минимален бал след 7. клас — MaturaHelp',
    description:
      'Изчисли бала си след 7. клас и виж в кои паралелки в София-град можеш да влезеш според приема за 2025 г.',
    url: 'https://www.maturahelp.com/kalkulator-bal',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
  },
}

export default function KalkulatorBalPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg">
        <section className="section-bg-light border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
            <p className="section-label text-primary mb-3">Прием след 7. клас</p>
            <h1 className="page-title text-3xl sm:text-4xl mb-4">
              Калкулатор за минимален бал
            </h1>
            <p className="text-base sm:text-lg text-text-muted max-w-2xl leading-relaxed">
              Изчисли бала си по официалната формула на МОН и провери в коя
              паралелка в София-град можеш да влезеш според приема за 2025 г.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="/dashboard/tests"
                className="btn-secondary"
              >
                Тренирай НВО тестове
              </Link>
              <Link href="/about" className="btn-ghost">
                За MaturaHelp →
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <PriemBalCalculator />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
