import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { makeCourseSchema, makeBreadcrumbSchema, makeFaqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'ДЗИ по Български език и Литература — Подготовка Матура | MaturaHelp',
  description: 'Подготви се за ДЗИ по БЕЛ (матура). Аргументативно съчинение, анализ на текст, литературни произведения. Официални тестове и видео уроци за 12 клас.',
  alternates: { canonical: '/dzi/bel' },
  openGraph: {
    title: 'ДЗИ по БЕЛ (Матура) — MaturaHelp',
    description: 'Подготовка за ДЗИ по Български език и Литература — аргументативно съчинение и анализ.',
    url: 'https://www.maturahelp.com/dzi/bel',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MaturaHelp — ДЗИ по БЕЛ' }],
  },
}

const faqs = [
  {
    question: 'Как е структуриран ДЗИ по БЕЛ?',
    answer: 'Изпитът включва две части: Първа част (езикови задачи и анализ на текст, 50 точки) и Втора част (съчинение по литературна тема, 50 точки). Общо 100 точки за 180 минути. Първата част съдържа задачи с избор на отговор и въпроси по откъс от изучавано произведение. Втората изисква аргументативно съчинение по зададена теза или свободна тема.',
  },
  {
    question: 'Кои произведения се изучават за ДЗИ по литература?',
    answer: 'Програмата обхваща произведения от 8. до 12. клас — класика на българската литература: Иван Вазов, Пенчо Славейков, Пейо Яворов, Елин Пелин, Йордан Йовков, Христо Смирненски, Гео Милев, Никола Вапцаров, Димитър Талев и Атанас Далчев. За всяко произведение е важно да познаваш историческия контекст, темите и художествените средства.',
  },
  {
    question: 'Как се оценява аргументативното съчинение на ДЗИ по БЕЛ?',
    answer: 'Съчинението се оценява по осем критерия: теза, аргументи, примери от текста, логическа структура, богатство на изказа, лексика, граматика и правопис. Всеки критерий носи различен брой точки. Честата грешка е да се пише преразказ вместо аргументиран текст — задължителната структура е: теза → аргументи с примери → заключение.',
  },
]

const topics = [
  'Аргументативно съчинение — структура и изграждане',
  'Анализ на художествен текст (поезия и проза)',
  'Анализ на нехудожествен текст',
  'Езикови задачи — правопис и пунктуация',
  'Лексикология и фразеология',
  'Литературни произведения от програмата 8–12 клас',
  'Контекстуален анализ на откъс',
  'Интерпретативно съчинение по зададена тема',
]

const bookCovers = [
  { src: '/nvo-literature/pod-igoto-predstavlenieto.jpg', alt: 'Под игото — Иван Вазов' },
  { src: '/nvo-literature/haiduti.jpg', alt: 'Хайдути — Пейо Яворов' },
  { src: '/nvo-literature/zatochenitsi.jpg', alt: 'Затворници — Елин Пелин' },
  { src: '/nvo-literature/nemili-nedragi.jpg', alt: 'Немили-недраги — Иван Вазов' },
]

export default function DziBelPage() {
  const courseSchema = makeCourseSchema({
    url: '/dzi/bel',
    name: 'Подготовка за ДЗИ по Български език и Литература — 12 клас',
    description: 'Пълна подготовка за матурата по БЕЛ — официални тестове от минали ДЗИ, видео уроци по всички произведения и упражнения за аргументативно съчинение.',
    educationalLevel: '12 клас',
    teaches: ['Аргументативно съчинение', 'Анализ на текст', 'Езикови задачи', 'Лексикология', 'Литературни произведения 8–12 клас', 'Правопис и пунктуация'],
  })
  const breadcrumbSchema = makeBreadcrumbSchema([
    { name: 'Начало', url: '/' },
    { name: 'ДЗИ', url: '/dzi' },
    { name: 'Български език и Литература', url: '/dzi/bel' },
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
              <span className="text-[#1B2845] font-medium">Български език и Литература</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">ДЗИ 12 клас</span>
                <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-[2.85rem] font-extrabold text-[#1B2845] mb-5">
                  Подготовка за ДЗИ по<br />
                  <span className="text-[#5899E2]">Български език и Литература</span>
                </h1>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Пълна подготовка за матурата по БЕЛ — официални тестове от минали ДЗИ, видео уроци
                  по всички произведения и упражнения за аргументативно съчинение.
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
                    href="/dzi/matematika"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3.5 rounded-full text-sm transition-all text-center"
                  >
                    Виж и Математика
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { num: '180 мин', label: 'изпитно време' },
                  { num: '100 т.', label: 'максимален резултат' },
                  { num: '2', label: 'части на изпита' },
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
              ДЗИ по БЕЛ e задължителен изпит за всички зрелостници. Изпитът проверява езикова компетентност
              и литературна грамотност на ниво 12. клас.
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

        {/* Book covers — section-bg-light */}
        <section
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-3">Произведения за матурата</h2>
            <p className="text-gray-500 text-[15px] mb-8 max-w-2xl">
              Програмата за ДЗИ обхваща произведения от 8. до 12. клас. За максимален резултат е важно
              да познаваш не само съдържанието, но и историческия контекст, темите и художествените средства.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bookCovers.map((book) => (
                <div key={book.alt} className="group">
                  <img
                    src={book.src}
                    alt={book.alt}
                    className="w-full h-48 md:h-56 object-cover rounded-2xl transition-transform group-hover:scale-[1.02]"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center leading-tight">{book.alt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prose — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-6">Как се пише аргументативно съчинение за ДЗИ</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Аргументативното съчинение е втората и най-тежка част на ДЗИ по БЕЛ — носи до 50 точки.
              Структурата е задължителна: въведение с теза, два-три основни аргумента с примери от
              изученото произведение, и заключение, което потвърждава тезата.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Честа грешка е писането на преразказ вместо аргументиране. Оценителите проверяват дали
              ученикът е изразил собствено становище, подкрепено с конкретни текстови примери. Цитатите
              се оценяват само ако са правилно контекстуализирани — не трябва да заменят аргумента.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              MaturaHelp включва модели на аргументативни съчинения по теми от предишни ДЗИ с коментар
              на структурата и грешките. Практиката с конкретни примери е по-ефективна от теоретично
              знаене на критериите за оценяване.
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Готов за матурата по БЕЛ?</h2>
            <p className="text-[#C5DDF1] text-[15px] mb-8">
              Регистрирай се безплатно и достъпи всички материали за ДЗИ по Български език и Литература.
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
