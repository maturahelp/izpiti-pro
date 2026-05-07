import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { makeCourseSchema, makeBreadcrumbSchema, makeFaqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'ДЗИ по Английски език — Подготовка Матура | MaturaHelp',
  description: 'Подготви се за ДЗИ по Английски език (матура). Reading comprehension, writing, grammar и vocabulary на ниво B1–B2. Официални тестове с решения за 12 клас.',
  alternates: { canonical: '/dzi/angliiski' },
  openGraph: {
    title: 'ДЗИ по Английски език (Матура) — MaturaHelp',
    description: 'Подготовка за ДЗИ по Английски — reading, writing и grammar на ниво B1–B2.',
    url: 'https://www.maturahelp.com/dzi/angliiski',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MaturaHelp — ДЗИ по Английски' }],
  },
}

const faqs = [
  {
    question: 'Как е структуриран ДЗИ по Английски език?',
    answer: 'Изпитът включва писмена и устна част. Писмената се провежда с тест: четене с разбиране (Reading), езикови задачи (Use of English/Grammar) и писане (Writing — формален имейл или есе). Нивото на изпита е B1–B2 по Европейската езикова рамка. Общо 100 точки, от които 60 за писмената и 40 за устната.',
  },
  {
    question: 'Трябва ли да знам граматика наизуст за ДЗИ по Английски?',
    answer: 'Не е нужно да помниш граматически термини наизуст, но трябва да използваш граматическите структури правилно в писмения и устния изпит. Глаголните времена, conditional sentences и passive voice са теми, които се появяват редовно. Практиката чрез четене и писане на английски е по-ефективна от зубрене на правила.',
  },
  {
    question: 'Как се оценява Writing частта на ДЗИ по Английски?',
    answer: 'Writing се оценява по пет критерия: съдържание (отговор на темата), организация (структура и свързаност), езиков обхват (разнообразие на речника и структурите), езикова точност (граматика и правопис) и стил (формален/неформален тон спрямо жанра). За максимален резултат e важно да спазваш зададения формат — формален имейл е различен от лично писмо.',
  },
]

const topics = [
  'Reading comprehension — разбиране на текст',
  'Vocabulary — лексика в контекст',
  'Grammar — глаголни времена и структури',
  'Use of English — трансформации и попълване',
  'Writing — формален имейл и есе',
  'Phrasal verbs и устойчиви изрази',
  'Passive voice и indirect speech',
  'Academic vocabulary за по-висок резултат',
]

const features = [
  { icon: '📖', title: 'Reading texts', body: 'Текстове с въпроси — точно форматирани като изпитните. Multiple choice, True/False, matching.' },
  { icon: '✍️', title: 'Writing models', body: 'Примерни имейли и есета с коментар на структурата и грешките.' },
  { icon: '🔤', title: 'Grammar practice', body: 'Целенасочени задачи по глаголни времена, conditionals и passive voice.' },
  { icon: '🎯', title: 'Use of English', body: 'Трансформации и попълване на пропуски — задачи с висок дял в изпита.' },
]

export default function DziAngliiskiPage() {
  const courseSchema = makeCourseSchema({
    url: '/dzi/angliiski',
    name: 'Подготовка за ДЗИ по Английски език — 12 клас',
    description: 'Целенасочена подготовка за матурата по Английски — reading comprehension, writing и grammar задачи по официалния изпитен формат на ниво B1–B2.',
    educationalLevel: '12 клас',
    teaches: ['Reading comprehension', 'Grammar', 'Vocabulary', 'Use of English', 'Writing — formal email and essay', 'Phrasal verbs'],
  })
  const breadcrumbSchema = makeBreadcrumbSchema([
    { name: 'Начало', url: '/' },
    { name: 'ДЗИ', url: '/dzi' },
    { name: 'Английски език', url: '/dzi/angliiski' },
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
              <span className="text-[#1B2845] font-medium">Английски език</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">ДЗИ 12 клас</span>
                <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-[2.85rem] font-extrabold text-[#1B2845] mb-5">
                  Подготовка за ДЗИ по<br />
                  <span className="text-[#5899E2]">Английски език</span>
                </h1>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Целенасочена подготовка за матурата по Английски — reading comprehension, writing и
                  grammar задачи по официалния изпитен формат на ниво B1–B2.
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
                  { num: 'B1–B2', label: 'ниво на изпита' },
                  { num: '100 т.', label: 'максимален резултат' },
                  { num: 'Writing', label: 'имейл и есе' },
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-3">Умения и теми</h2>
            <p className="text-gray-500 text-[15px] mb-8 max-w-2xl">
              ДЗИ по Английски проверява четирите езикови умения: четене, писане, слушане и говорене.
              Писмената и устната части са отделни и се оценяват независимо.
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
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-6">Как да се подготвиш за ДЗИ по Английски</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Reading comprehension е умение, което се подобрява с практика — не с учене на правила.
              Четенето на оригинални текстове на английски (новини, статии, книги на ниво B1–B2) е
              по-ефективно от четенето само на изпитни текстове. MaturaHelp включва разнообразни
              текстове с въпроси, форматирани точно като тези в изпита.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Writing e частта, в която разликата между оценките е най-голяма. Формалният имейл изисква
              специфична структура: поздрав, цел на писмото, основни точки и затваряне. Есето изисква
              теза, аргументи и заключение. Грешките в тона (неформален тон в формален имейл) водят до
              загуба на точки дори при добра граматика.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Use of English задачите (трансформации, попълване на пропуски с правилна граматична форма)
              изглеждат лесни, но изискват автоматично владеене на структурите. Практиката с поне 10–15
              такива задачи на ден в последните две седмици преди изпита значително повишава резултата.
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Готов за матурата по Английски?</h2>
            <p className="text-[#C5DDF1] text-[15px] mb-8">
              Регистрирай се безплатно и достъпи всички материали за ДЗИ по Английски език.
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
