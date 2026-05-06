import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'НВО по Математика — Подготовка 7 клас | MaturaHelp',
  description: 'Подготви се за НВО по Математика след 7 клас. Тестове с числа, уравнения, геометрия и задачи. Всички официални формати с подробни решения.',
  alternates: { canonical: '/nvo/matematika' },
  openGraph: {
    title: 'НВО по Математика 7 клас — MaturaHelp',
    description: 'Тестове и упражнения по Математика за НВО след 7 клас — числа, алгебра и геометрия.',
    url: 'https://www.maturahelp.com/nvo/matematika',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
  },
}

const topics = [
  'Рационални числа — операции и свойства',
  'Степени с естествен показател',
  'Алгебрични изрази и тъждества',
  'Линейни уравнения и неравенства',
  'Системи линейни уравнения',
  'Функции и техните графики',
  'Геометрия — триъгълници и четириъгълници',
  'Окръжност и кръг — дъга, сектор, пресмятания',
  'Комбинаторика и вероятности',
  'Задачи с практическа насоченост',
]

const faqs = [
  {
    q: 'Как е структуриран НВО по Математика?',
    a: 'Изпитът включва задачи с избор на отговор и задачи с кратък и разширен отговор. Общо 100 точки за 90 минути.',
  },
  {
    q: 'Нужен ли е калкулатор на НВО по Математика?',
    a: 'На изпита не се разрешава използване на калкулатор. Всички изчисления се правят с ръка.',
  },
  {
    q: 'Кои теми носят най-много точки?',
    a: 'Алгебричните задачи и геометрията носят най-много точки. Задачите с практическа насоченост са задължителни за максимален резултат.',
  },
]

export default function NvoMatematikaPage() {
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
              <span className="text-[#1B2845] font-medium">Математика</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">НВО 7 клас</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] leading-tight mb-4">
                  Подготовка за НВО по<br />
                  <span className="text-[#5899E2]">Математика</span>
                </h1>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Систематична подготовка за НВО по Математика след 7 клас — официални тестове от минали години,
                  задачи по всички теми и стъпка-по-стъпка решения.
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
                  { num: '90 мин', label: 'изпитно време' },
                  { num: '100%', label: 'официален формат' },
                  { num: '10+', label: 'теми от програмата' },
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
            <h2 className="text-2xl font-extrabold text-white mb-4">Готов да решаваш задачи?</h2>
            <p className="text-[#9AC2E8] mb-8">Регистрирай се безплатно и достъпи всички материали за НВО по Математика.</p>
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
