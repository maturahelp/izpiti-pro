import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'За нас — MaturaHelp',
  description: 'Научете повече за MaturaHelp — платформата за подготовка за НВО и ДЗИ, създадена от ученици за ученици.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'За нас — MaturaHelp',
    description: 'Научете повече за MaturaHelp — платформата за подготовка за НВО и ДЗИ.',
    url: 'https://www.maturahelp.com/about',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
  },
}

const stats = [
  { value: '4 800+', label: 'активни ученици' },
  { value: '500+', label: 'теста и упражнения' },
  { value: '7–12', label: 'клас покритие' },
  { value: '2', label: 'изпита: НВО и ДЗИ' },
]

const values = [
  {
    title: 'Достъпност',
    body: 'Качествена подготовка не трябва да зависи от частни уроци или скъпи учебници. MaturaHelp е достъпна за всеки ученик в България.',
  },
  {
    title: 'Ефективност',
    body: 'Съдържанието е директно насочено към изпитните формати на НВО и ДЗИ — без излишна теория, само онова, което носи точки.',
  },
  {
    title: 'Прозрачност',
    body: 'Виждаш своя напредък в реално време. Знаеш какво си минал и какво ти остава преди изпита.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-[#F8FAFF] py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#5899E2] mb-4">За нас</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B2845] leading-tight mb-6">
              Подготовка за НВО и ДЗИ,<br />
              <span className="text-[#5899E2]">създадена от ученици</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
              MaturaHelp е образователна платформа, създадена с една цел: да помогне на всеки ученик
              в България да се подготви ефективно за НВО след 7 клас и ДЗИ след 12 клас.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-12 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-extrabold text-[#5899E2] mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-6">Нашата мисия</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Подготовката за НВО и ДЗИ е едно от най-стресиращите преживявания в живота на всеки ученик.
                Намирането на качествени и актуални материали, организирани в логична система, беше почти невъзможно.
              </p>
              <p>
                MaturaHelp e създадена, за да реши точно този проблем. Събрахме официалните изпитни материали,
                добавихме видео уроци по ключовите теми и изградихме система за проследяване на напредъка —
                всичко на едно място.
              </p>
              <p>
                Вярваме, че всеки ученик заслужава достъп до качествена подготовка, независимо от
                финансовите възможности на семейството му.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20 bg-[#F8FAFF]">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-10 text-center">Нашите ценности</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                  <h3 className="text-lg font-bold text-[#1B2845] mb-3">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-[#1B2845] mb-8">Какво предлагаме</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'НВО 7 клас', desc: 'Пълна подготовка по БЕЛ и Математика — официални тестове, практически упражнения и видео уроци по всички теми от програмата.', href: '/nvo' },
                { title: 'ДЗИ 12 клас', desc: 'Подготовка за зрелостния изпит по БЕЛ и Математика — анализ на текст, аргументативни съчинения и тестове от минали години.', href: '/dzi' },
                { title: 'Видео уроци', desc: 'Кратки и ясни видео уроци по ключовите теми в литературата и математиката — оптимизирани за учене на телефон.', href: '/register' },
                { title: 'AI помощник', desc: 'Задавай въпроси по темата, получавай обяснения и анализирай грешките си с помощта на изкуствен интелект.', href: '/register' },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block p-6 rounded-2xl border border-gray-100 hover:border-[#5899E2] hover:shadow-[0_4px_20px_rgba(88,153,226,0.1)] transition-all group"
                >
                  <h3 className="text-base font-bold text-[#1B2845] mb-2 group-hover:text-[#5899E2] transition-colors">{item.title} →</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 md:py-20 bg-[#1B2845]">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">Свържи се с нас</h2>
            <p className="text-[#9AC2E8] mb-8 text-lg">
              Имаш въпрос, предложение или обратна връзка? Ще се радваме да чуем от теб.
            </p>
            <a
              href="mailto:support@maturahelp.com"
              className="inline-block bg-[#5899E2] hover:bg-[#335C81] text-white font-semibold px-10 py-4 rounded-full text-base transition-all"
            >
              support@maturahelp.com
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
