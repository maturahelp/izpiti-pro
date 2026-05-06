import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'ДЗИ по Математика — Подготовка Матура | MaturaHelp',
  description: 'Подготви се за ДЗИ по Математика (матура). Алгебра, геометрия, тригонометрия и вероятности. Официални тестове с подробни решения.',
  alternates: { canonical: '/dzi/matematika' },
  openGraph: {
    title: 'ДЗИ по Математика (Матура) — MaturaHelp',
    description: 'Подготовка за ДЗИ по Математика — алгебра, геометрия и вероятности.',
    url: 'https://www.maturahelp.com/dzi/matematika',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
  },
}

const topics = [
  'Функции — свойства, графики и трансформации',
  'Тригонометрия — формули и уравнения',
  'Логаритмични и показателни функции',
  'Производна — изчисляване и приложения',
  'Интеграл — пресмятане на лице',
  'Аналитична геометрия в равнината',
  'Стереометрия — тела и сечения',
  'Комбинаторика и вероятности',
  'Числови редици и прогресии',
  'Системи уравнения и неравенства',
]

const faqs = [
  {
    q: 'Как е структуриран ДЗИ по Математика?',
    a: 'Изпитът включва 32 задачи — 20 с избор на отговор и 12 с кратък или разширен отговор. Общо 100 точки за 180 минути.',
  },
  {
    q: 'Разрешен ли е калкулатор на ДЗИ по Математика?',
    a: 'Да, разрешен е несложен калкулатор (без CAS/компютърна алгебра). Проверете конкретните изисквания за текущата година.',
  },
  {
    q: 'Кои теми са задължителни за подготовка?',
    a: 'Функциите, производната, вероятностите и стереометрията са теми с най-висок дял в изпита.',
  },
]

export default function DziMatematikaPage() {
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
              <span className="text-[#1B2845] font-medium">Математика</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">ДЗИ 12 клас</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] leading-tight mb-4">
                  Подготовка за ДЗИ по<br />
                  <span className="text-[#5899E2]">Математика</span>
                </h1>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Пълна подготовка за матурата по Математика — официални тестове от минали ДЗИ,
                  задачи по всички теми от програмата и подробни решения стъпка по стъпка.
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
                  { num: '180 мин', label: 'изпитно време' },
                  { num: '32', label: 'задачи в изпита' },
                  { num: '100 т.', label: 'максимален резултат' },
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
            <h2 className="text-2xl font-extrabold text-white mb-4">Готов за матурата по Математика?</h2>
            <p className="text-[#9AC2E8] mb-8">Регистрирай се безплатно и достъпи всички материали за ДЗИ по Математика.</p>
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
