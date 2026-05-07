import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { makeCourseSchema, makeBreadcrumbSchema, makeFaqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'ДЗИ по Математика — Подготовка Матура | MaturaHelp',
  description: 'Подготви се за ДЗИ по Математика (матура). Алгебра, геометрия, тригонометрия и вероятности. Официални тестове с подробни решения за 12 клас.',
  alternates: { canonical: '/dzi/matematika' },
  openGraph: {
    title: 'ДЗИ по Математика (Матура) — MaturaHelp',
    description: 'Подготовка за ДЗИ по Математика — алгебра, геометрия и вероятности за 12 клас.',
    url: 'https://www.maturahelp.com/dzi/matematika',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MaturaHelp — ДЗИ по Математика' }],
  },
}

const faqs = [
  {
    question: 'Как е структуриран ДЗИ по Математика?',
    answer: 'Изпитът включва 32 задачи — 20 задачи с избор на отговор (по 2 точки всяка) и 12 задачи с кратък или разширен отговор (по 4–8 точки). Общо 100 точки за 180 минути. Разширените задачи изискват пълно решение с обяснение на всяка стъпка — само крайният отговор без ход на решение носи нула точки.',
  },
  {
    question: 'Разрешен ли е калкулатор на ДЗИ по Математика?',
    answer: 'Да, разрешен е несложен калкулатор (без CAS — компютърна алгебрена система). Не се разрешават програмируеми калкулатори. Препоръчва се да провериш конкретните изисквания за текущата учебна година в официалния бюлетин на МОН, тъй като правилата може да се актуализират.',
  },
  {
    question: 'Кои теми са задължителни за подготовка по ДЗИ Математика?',
    answer: 'Функциите, производната и интегралът са с най-висок дял в изпита и са задължителни за всеки зрелостник по Математика. Вероятностите и комбинаториката носят значителен брой точки и са теми, по които разликата между добра и отлична оценка е най-голяма. Стереометрията се появява почти всяка година с поне две задачи.',
  },
]

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

const features = [
  { icon: '📈', title: 'Функции и производни', body: 'Пълен разбор на функциите с графики, монотонност, екстремуми и приложения.' },
  { icon: '📐', title: 'Стереометрия', body: 'Триизмерните задачи са обяснени с чертежи и стъпка-по-стъпка решения.' },
  { icon: '🎲', title: 'Вероятности', body: 'Комбинаторика и вероятности — теми с висок дял и голяма разлика между оценките.' },
  { icon: '⏱️', title: 'Реален изпитен формат', body: 'Тестовете в MaturaHelp следват точния формат на ДЗИ — 32 задачи, 180 минути.' },
]

export default function DziMatematikaPage() {
  const courseSchema = makeCourseSchema({
    url: '/dzi/matematika',
    name: 'Подготовка за ДЗИ по Математика — 12 клас',
    description: 'Пълна подготовка за матурата по Математика — официални тестове от минали ДЗИ, задачи по всички теми от програмата и подробни решения стъпка по стъпка.',
    educationalLevel: '12 клас',
    teaches: ['Функции', 'Тригонометрия', 'Производна', 'Интеграл', 'Стереометрия', 'Вероятности', 'Комбинаторика', 'Аналитична геометрия'],
  })
  const breadcrumbSchema = makeBreadcrumbSchema([
    { name: 'Начало', url: '/' },
    { name: 'ДЗИ', url: '/dzi' },
    { name: 'Математика', url: '/dzi/matematika' },
  ])
  const faqSchema = makeFaqSchema(faqs)

  return (
    <>
      <JsonLd data={[courseSchema, breadcrumbSchema, faqSchema]} />
      <Header />

      <main>
        {/* Hero */}
        <section
          className="relative overflow-hidden pt-24 pb-14 md:pt-32 md:pb-20"
          style={{ background: 'linear-gradient(90deg, #f0efff 0%, #d9f0ff 55%, #edf9f3 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <nav className="text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-[#5899E2] transition-colors">Начало</Link>
              <span className="mx-2 text-gray-400">›</span>
              <Link href="/dzi" className="hover:text-[#5899E2] transition-colors">ДЗИ</Link>
              <span className="mx-2 text-gray-400">›</span>
              <span className="text-[#1B2845] font-medium">Математика</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">ДЗИ 12 клас</span>
                <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-[2.85rem] font-extrabold text-[#1B2845] mb-5">
                  Подготовка за ДЗИ по<br />
                  <span className="text-[#5899E2]">Математика</span>
                </h1>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Пълна подготовка за матурата по Математика — официални тестове от минали ДЗИ,
                  задачи по всички теми от програмата и подробни решения стъпка по стъпка.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link
                    href="/register"
                    className="inline-block text-white font-semibold px-8 py-3.5 rounded-full text-sm hover:shadow-lg hover:shadow-blue-200 transition-all text-center"
                    style={{ background: 'linear-gradient(135deg, #5899E2 0%, #335C81 100%)' }}
                  >
                    Започни безплатно
                  </Link>
                  <Link
                    href="/dzi/bel"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3.5 rounded-full text-sm transition-all text-center"
                  >
                    Виж и БЕЛ
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
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl p-5 text-center"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                  >
                    <div className="text-2xl font-extrabold text-[#5899E2] mb-1">{s.num}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Topics — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-3">Теми в изпита</h2>
            <p className="text-gray-500 text-[15px] mb-8 max-w-2xl">
              ДЗИ по Математика е втори задължителен държавен изпит за зрелостниците, избрали Математика
              като профилиращ предмет. Изпитът включва цялата математическа програма от 8. до 12. клас.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {topics.map((t) => (
                <div
                  key={t}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                >
                  <span
                    className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #F0F6FC, #E0EDF8)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#5899E2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — section-bg-light */}
        <section
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-10 text-center">Какво ще намериш в MaturaHelp</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-7 flex items-start gap-4"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                >
                  <span className="text-3xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <h3 className="font-bold text-[#1B2845] mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prose — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-6">Как да се подготвиш за ДЗИ по Математика</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Функциите, производната и интегралът са теми с постоянно висок дял в изпита. Преди да
              преминеш към по-сложни задачи, увери се, че можеш бързо и точно да намираш производни и
              да пресмяташ прости интеграли. Тези умения стоят в основата на половината от изпита.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Стереометрията се появява почти всяка година и изисква пространствено мислене. Рисуването
              на чертеж — дори груб — преди да решиш задачата е задължително. Без визуализация вероятността
              от грешка е значително по-висока. MaturaHelp включва задачи с готови чертежи и анимирани обяснения.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Задачите с разширен отговор се оценяват по-стъпково — всяка правилна стъпка носи точки,
              дори ако крайният отговор е грешен. Затова е важно да записваш всяка стъпка от решението
              ясно и наредено. Практиката с оценявани решения е по-ефективна от просто четене на теория.
            </p>
          </div>
        </section>

        {/* FAQ — section-bg-light */}
        <section
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-8">Често задавани въпроси</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl p-6"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                >
                  <h3 className="font-bold text-[#1B2845] mb-3">{faq.question}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-16 md:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #5899E2 0%, #335C81 50%, #274060 100%)' }}
        >
          <div className="max-w-xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Готов за матурата по Математика?</h2>
            <p className="text-[#C5DDF1] text-[15px] mb-8">
              Регистрирай се безплатно и достъпи всички материали за ДЗИ по Математика.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-[#335C81] font-semibold px-10 py-4 rounded-full text-sm hover:shadow-xl transition-all"
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
