import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'ДЗИ по Английски език — Подготовка Матура | MaturaHelp',
  description: 'Подготви се за ДЗИ по Английски език (матура). Reading comprehension, writing, grammar и vocabulary. Официални тестове с подробни решения.',
  alternates: { canonical: '/dzi/angliiski' },
  openGraph: {
    title: 'ДЗИ по Английски език (Матура) — MaturaHelp',
    description: 'Подготовка за ДЗИ по Английски — reading, writing и grammar.',
    url: 'https://www.maturahelp.com/dzi/angliiski',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
  },
}

const topics = [
  'Reading comprehension — разбиране на текст',
  'Vocabulary — лексика в контекст',
  'Grammar — глаголни времена и структури',
  'Use of English — трансформации и попълване',
  'Writing — формален имейл и есе',
  'Listening comprehension (при устен изпит)',
  'Phrasal verbs и устойчиви изрази',
  'Academic vocabulary за по-висок резултат',
]

const faqs = [
  {
    q: 'Как е структуриран ДЗИ по Английски?',
    a: 'Изпитът включва писмена и устна част. Писмената включва четене с разбиране, езикови задачи и писане. Общо 100 точки.',
  },
  {
    q: 'На какво ниво е ДЗИ по Английски?',
    a: 'Изпитът е на ниво B1-B2 според Европейската езикова рамка. Подготовката с MaturaHelp е съобразена точно с това ниво.',
  },
  {
    q: 'Достатъчна ли е подготовката само с тестове?',
    a: 'Тестовете са ключови, но е важно да упражнявате и writing задачи. MaturaHelp предлага примерни Writing Prompts с насоки за структура.',
  },
]

export default function DziAngliiski() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-[#F0F6FC] py-14 md:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <nav className="text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-[#5899E2]">Начало</Link>
              <span className="mx-2">›</span>
              <Link href="/dzi" className="hover:text-[#5899E2]">ДЗИ</Link>
              <span className="mx-2">›</span>
              <span className="text-[#1B2845] font-medium">Английски език</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">ДЗИ 12 клас</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] leading-tight mb-4">
                  Подготовка за ДЗИ по<br />
                  <span className="text-[#5899E2]">Английски език</span>
                </h1>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Целенасочена подготовка за матурата по Английски — reading comprehension, writing и
                  grammar задачи по официалния изпитен формат.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/register"
                    className="inline-block bg-[#5899E2] hover:bg-[#335C81] text-white font-semibold px-8 py-3 rounded-full text-sm transition-all text-center"
                  >
                    Започни безплатно
                  </Link>
                  <Link
                    href="/dzi"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3 rounded-full text-sm transition-all text-center"
                  >
                    Всички ДЗИ материали
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { num: 'B1–B2', label: 'ниво на изпита' },
                  { num: '100%', label: 'официален формат' },
                  { num: 'Writing', label: 'есе и имейл практика' },
                  { num: '12 клас', label: 'ниво на подготовка' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-center">
                    <div className="text-2xl font-extrabold text-[#5899E2] mb-1">{s.num}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Topics */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-[#1B2845] mb-8">Теми и умения</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {topics.map((t) => (
                <div key={t} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFF]">
                  <span className="text-[#5899E2] font-bold mt-0.5">✓</span>
                  <span className="text-sm text-gray-700">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-20 bg-[#F8FAFF]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-[#1B2845] mb-8">Често задавани въпроси</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <h3 className="font-bold text-[#1B2845] mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 md:py-16 bg-[#1B2845] text-center">
          <div className="max-w-xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-white mb-4">Готов за матурата по Английски?</h2>
            <p className="text-[#9AC2E8] mb-8">Регистрирай се безплатно и достъпи всички материали за ДЗИ по Английски.</p>
            <Link
              href="/register"
              className="inline-block bg-[#5899E2] hover:bg-[#335C81] text-white font-semibold px-10 py-4 rounded-full text-base transition-all"
            >
              Създай безплатен акаунт
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
