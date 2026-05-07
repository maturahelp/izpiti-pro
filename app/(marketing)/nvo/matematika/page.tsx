import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { makeCourseSchema, makeBreadcrumbSchema, makeFaqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'НВО по Математика — Подготовка 7 клас | MaturaHelp',
  description: 'Подготви се за НВО по Математика след 7 клас. Числа, уравнения, геометрия и задачи с практическа насоченост. Всички официални формати с подробни решения.',
  alternates: { canonical: '/nvo/matematika' },
  openGraph: {
    title: 'НВО по Математика 7 клас — MaturaHelp',
    description: 'Тестове и упражнения по Математика за НВО след 7 клас — числа, алгебра и геометрия.',
    url: 'https://www.maturahelp.com/nvo/matematika',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MaturaHelp — НВО по Математика' }],
  },
}

const faqs = [
  {
    question: 'Как е структуриран НВО по Математика?',
    answer: 'Изпитът включва задачи с избор на отговор и задачи с кратък и разширен отговор — общо 100 точки за 90 минути. Задачите с избор на отговор носят по 4 точки, задачите с кратък отговор — по 4–8 точки, а задачата с разширен отговор (практическа задача) носи до 16 точки и изисква пълно решение с обяснение.',
  },
  {
    question: 'Нужен ли е калкулатор на НВО по Математика?',
    answer: 'На изпита не се разрешава използване на калкулатор. Всички изчисления се правят с ръка. Затова е важно да упражняваш изчисления с естествени и рационални числа, степени и корени без калкулатор. MaturaHelp включва задачи, специално насочени към развиване на тази изчислителна точност.',
  },
  {
    question: 'Кои теми носят най-много точки на НВО по Математика?',
    answer: 'Алгебричните задачи (уравнения, неравенства, функции) и геометрията носят най-много точки. Задачата с практическа насоченост в края на изпита носи до 16 точки и е задължителна за максимален резултат. Комбинаторика и вероятности са теми, по които много ученици губят точки, защото не им обръщат достатъчно внимание.',
  },
]

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

const features = [
  { icon: '📐', title: 'Геометрия с фигури', body: 'Всяка геометрична задача е придружена от чертеж. Виждаш формулите в контекст.' },
  { icon: '📊', title: 'Алгебра стъпка по стъпка', body: 'Уравненията и функциите са обяснени с пълни решения, не само с отговори.' },
  { icon: '🎯', title: 'Практически задачи', body: 'Специален блок с реалистични задачи — точно форматирани като изпитните.' },
  { icon: '⏱️', title: 'Тайминг на изпита', body: 'Решаваш тестове в реалното изпитно време — 90 минути, без калкулатор.' },
]

export default function NvoMatematikaPage() {
  const courseSchema = makeCourseSchema({
    url: '/nvo/matematika',
    name: 'Подготовка за НВО по Математика — 7 клас',
    description: 'Систематична подготовка за НВО по Математика след 7 клас — официални тестове от минали години, задачи по всички теми и стъпка-по-стъпка решения.',
    educationalLevel: '7 клас',
    teaches: ['Рационални числа', 'Степени', 'Алгебрични изрази', 'Линейни уравнения', 'Функции', 'Геометрия', 'Окръжност', 'Вероятности'],
  })
  const breadcrumbSchema = makeBreadcrumbSchema([
    { name: 'Начало', url: '/' },
    { name: 'НВО', url: '/nvo' },
    { name: 'Математика', url: '/nvo/matematika' },
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
              <Link href="/nvo" className="hover:text-[#5899E2] transition-colors">НВО</Link>
              <span className="mx-2 text-gray-400">›</span>
              <span className="text-[#1B2845] font-medium">Математика</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">НВО 7 клас</span>
                <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-[2.85rem] font-extrabold text-[#1B2845] mb-5">
                  Подготовка за НВО по<br />
                  <span className="text-[#5899E2]">Математика</span>
                </h1>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Систематична подготовка за НВО по Математика след 7 клас — официални тестове от минали
                  години, задачи по всички теми и стъпка-по-стъпка решения без калкулатор.
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
                    href="/nvo/bel"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3.5 rounded-full text-sm transition-all text-center"
                  >
                    Виж и БЕЛ
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { num: '90 мин', label: 'изпитно време' },
                  { num: '100%', label: 'официален формат' },
                  { num: '10+', label: 'теми от програмата' },
                  { num: 'без', label: 'калкулатор' },
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
              НВО по Математика обхваща целия материал от 5. до 7. клас. Изпитът включва три вида задачи:
              с избор на отговор, с кратък отговор и задача с разширен отговор.
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-10 text-center">Какво ще можеш след подготовката</h2>
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
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-6">Как да се подготвиш ефективно</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Геометрията и алгебрата носят най-много точки на НВО по Математика, но комбинаторика и
              вероятности са теми, по които много ученици губят точки. Редовното решаване на тестове
              по тях е ключово — матрицата за оценяване не прощава пропуснати точки в тези задачи.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Тъй като калкулатор не е разрешен, е важно да развиеш скорост и точност в изчисленията.
              Практиката с дроби, корени и степени ръчно трябва да стане автоматична — не само разбиране,
              но и бързина. MaturaHelp включва задачи, специално настроени за тренировка без калкулатор.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Задачата с разширен отговор в края на изпита изисква пълно записано решение. Оценява се
              не само крайният отговор, но и логическата последователност. Тренировката с модели на такива
              задачи е задължителна за висок резултат.
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Готов да решаваш задачи?</h2>
            <p className="text-[#C5DDF1] text-[15px] mb-8">
              Регистрирай се безплатно и достъпи всички материали за НВО по Математика.
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
