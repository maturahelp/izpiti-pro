import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { makeCourseSchema, makeBreadcrumbSchema, makeFaqSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'НВО по Български език и Литература — Подготовка 7 клас | MaturaHelp',
  description: 'Подготви се за НВО по БЕЛ след 7 клас. Тестове с четене с разбиране, анализ на текст и езикови задачи по официалния формат. 500+ задачи, видео уроци.',
  alternates: { canonical: '/nvo/bel' },
  openGraph: {
    title: 'НВО по БЕЛ 7 клас — MaturaHelp',
    description: 'Тестове, видео уроци и практика по Български език и Литература за НВО след 7 клас.',
    url: 'https://www.maturahelp.com/nvo/bel',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MaturaHelp — НВО по БЕЛ' }],
  },
}

const faqs = [
  {
    question: 'Как е структуриран НВО по БЕЛ?',
    answer: 'Изпитът включва две части: Четене с разбиране (40 точки) и Писане (60 точки). Общо 100 точки за 150 минути. Първата част съдържа задачи с избор на отговор и кратък свободен отговор по художествен и нехудожествен текст. Втората част изисква написване на съчинение-разсъждение по зададена тема.',
  },
  {
    question: 'Кои произведения се изучават за НВО по литература?',
    answer: 'Програмата включва произведения от 5., 6. и 7. клас — поезия, проза и драма на утвърдени български автори. Сред задължителните произведения са творби на Иван Вазов, Христо Ботев, Алеко Константинов, Елин Пелин и Йордан Йовков. За всяко произведение е важно да познаваш темите, героите и идеите — не само сюжета.',
  },
  {
    question: 'Колко точки са нужни за отличен на НВО по БЕЛ?',
    answer: 'За оценка "отличен 6" обикновено са необходими между 87 и 100 точки. Минималният праг за преминаване е 30 точки. Съчинението носи до 60 точки и е ключово за високия резултат — затова практиката на писане е задължителна част от подготовката.',
  },
]

const topics = [
  'Четене с разбиране — художествени и нехудожествени текстове',
  'Лексика и фразеология — значение на думи и изрази',
  'Морфология — части на речта и техните форми',
  'Синтаксис — изречения и пунктуация',
  'Правопис — трудни правописни случаи',
  'Литература — теми и произведения от програмата',
  'Анализ на откъси от изучавани творби',
  'Съчинение-разсъждение по зададена тема',
]

const bookCovers = [
  { src: '/nvo-literature/pod-igoto-predstavlenieto.jpg', alt: 'Под игото — Иван Вазов' },
  { src: '/nvo-literature/nerazdelni.jpg', alt: 'Неразделни — Христо Смирненски' },
  { src: '/nvo-literature/bai-ganio-patuva.jpg', alt: 'Бай Ганьо пътува — Алеко Константинов' },
  { src: '/nvo-literature/edna-bulgarka.jpg', alt: 'Една Българка — Иван Вазов' },
]

export default function NvoBelPage() {
  const courseSchema = makeCourseSchema({
    url: '/nvo/bel',
    name: 'Подготовка за НВО по Български език и Литература — 7 клас',
    description: 'Целенасочена подготовка за НВО по БЕЛ след 7 клас — официални тестове от минали години, видео уроци по ключовите теми и задачи по всички части на изпита.',
    educationalLevel: '7 клас',
    teaches: ['Четене с разбиране', 'Лексика и фразеология', 'Морфология', 'Синтаксис и пунктуация', 'Правопис', 'Литература', 'Анализ на текст', 'Съчинение'],
  })
  const breadcrumbSchema = makeBreadcrumbSchema([
    { name: 'Начало', url: '/' },
    { name: 'НВО', url: '/nvo' },
    { name: 'Български език и Литература', url: '/nvo/bel' },
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
              <span className="text-[#1B2845] font-medium">Български език и Литература</span>
            </nav>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">НВО 7 клас</span>
                <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-[2.85rem] font-extrabold text-[#1B2845] mb-5">
                  Подготовка за НВО по<br />
                  <span className="text-[#5899E2]">Български език и Литература</span>
                </h1>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Целенасочена подготовка за НВО по БЕЛ след 7 клас — официални тестове от минали години,
                  видео уроци по ключовите теми и задачи по всички части на изпита.
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
                    href="/nvo/matematika"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3.5 rounded-full text-sm transition-all text-center"
                  >
                    Виж и Математика
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
              НВО по БЕЛ обхваща езикови знания и умения от 5. до 7. клас. Изпитът проверява не само
              граматика и правопис, но и способността да четеш, разбираш и анализираш различни видове текстове.
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-3">Произведения за подготовка</h2>
            <p className="text-gray-500 text-[15px] mb-8 max-w-2xl">
              Литературната програма за НВО включва произведения от 5., 6. и 7. клас.
              За успех на изпита е важно да познаваш добре темите, героите и идеите на всяко произведение.
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

        {/* Prose section — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-6">Как се оценява НВО по БЕЛ</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Четенето с разбиране носи 40 точки и включва задачи с избор на отговор, верен/грешен и кратък
              свободен отговор по художествен или нехудожествен текст. Тук е важно да четеш внимателно — много
              отговори са скрити директно в текста.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Писането носи до 60 точки и се оценява по критерии: съответствие с темата, структура,
              аргументация, езикова правилност и богатство на изказа. Честа грешка е написването на
              преразказ вместо разсъждение — MaturaHelp включва модели с правилна структура, за да избегнеш това.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Езиковите задачи включват правопис, пунктуация, морфология и лексика. Редовното решаване на
              тестове по тези теми е най-бързият начин да затвърдиш знанията и да избегнеш грешки в изпита.
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

        {/* CTA — cta-gradient */}
        <section
          className="py-16 md:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #5899E2 0%, #335C81 50%, #274060 100%)' }}
        >
          <div className="max-w-xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Готов да започнеш?</h2>
            <p className="text-[#C5DDF1] text-[15px] mb-8">
              Регистрирай се безплатно и достъпи всички материали за НВО по БЕЛ.
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
