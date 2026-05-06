import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'НВО по Български език и Литература — Подготовка 7 клас | MaturaHelp',
  description: 'Подготви се за НВО по БЕЛ след 7 клас. Тестове с четене с разбиране, анализ на текст и езикови задачи. Всички официални формати + видео уроци.',
  alternates: { canonical: '/nvo/bel' },
  openGraph: {
    title: 'НВО по БЕЛ 7 клас — MaturaHelp',
    description: 'Тестове, видео уроци и практика по Български език и Литература за НВО след 7 клас.',
    url: 'https://www.maturahelp.com/nvo/bel',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
  },
}

const topics = [
  'Четене с разбиране — художествени и нехудожествени текстове',
  'Лексика и фразеология — значение на думи и изрази',
  'Морфология — части на речта и техните форми',
  'Синтаксис — изречения и пунктуация',
  'Правопис — трудни правописни случаи',
  'Литература — теми и произведения от програмата',
  'Анализ на откъси от изучавани творби',
  'Съчинение-разсъждение по дадена тема',
]

const faqs = [
  {
    q: 'Как е структуриран НВО по БЕЛ?',
    a: 'Изпитът включва две части: Четене с разбиране (40 т.) и Писане (60 т.). Общо 100 точки за 150 минути.',
  },
  {
    q: 'Кои произведения се изучават за НВО по литература?',
    a: 'Програмата включва произведения от 5., 6. и 7. клас — поезия, проза и драма на утвърдени български автори.',
  },
  {
    q: 'Колко теста са налични в MaturaHelp?',
    a: 'Платформата съдържа всички официални тестове от минали НВО, плюс допълнителни практически задания.',
  },
]

export default function NvoBelPage() {
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
              <Link href="/nvo" className="hover:text-[#5899E2]">НВО</Link>
              <span className="mx-2">›</span>
              <span className="text-[#1B2845] font-medium">Български език и Литература</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">НВО 7 клас</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] leading-tight mb-4">
                  Подготовка за НВО по<br />
                  <span className="text-[#5899E2]">Български език и Литература</span>
                </h1>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Целенасочена подготовка за НВО по БЕЛ след 7 клас — официални тестове от минали години,
                  видео уроци по ключовите теми и задачи по всички части на изпита.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/register"
                    className="inline-block bg-[#5899E2] hover:bg-[#335C81] text-white font-semibold px-8 py-3 rounded-full text-sm transition-all text-center"
                  >
                    Започни безплатно
                  </Link>
                  <Link
                    href="/nvo"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3 rounded-full text-sm transition-all text-center"
                  >
                    Всички НВО материали
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { num: '500+', label: 'задачи по БЕЛ' },
                  { num: '100%', label: 'официален формат' },
                  { num: '150 мин', label: 'реално изпитно време' },
                  { num: '7 клас', label: 'ниво на подготовка' },
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
            <h2 className="text-2xl font-extrabold text-[#1B2845] mb-8">Теми в изпита</h2>
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
            <h2 className="text-2xl font-extrabold text-white mb-4">Готов да започнеш?</h2>
            <p className="text-[#9AC2E8] mb-8">Регистрирай се безплатно и достъпи всички материали за НВО по БЕЛ.</p>
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
