import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'За нас — MaturaHelp',
  description: 'По-ясна и структурирана подготовка за НВО и ДЗИ. Научете повече за MaturaHelp — нашата мисия, подход и какво предлагаме.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'За нас — MaturaHelp',
    description: 'По-ясна и структурирана подготовка за НВО и ДЗИ.',
    url: 'https://www.maturahelp.com/about',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MaturaHelp — Подготовка за НВО и ДЗИ' }],
  },
}

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.maturahelp.com/about',
  url: 'https://www.maturahelp.com/about',
  name: 'За MaturaHelp',
  description: 'По-ясна и структурирана подготовка за НВО и ДЗИ.',
  inLanguage: 'bg',
  isPartOf: { '@id': 'https://www.maturahelp.com/#website' },
  about: { '@id': 'https://www.maturahelp.com/#organization' },
}

const approach = [
  {
    title: 'Кратки и разбираеми уроци',
    body: 'Материалът е представен без излишно усложняване. Всяка тема е обяснена стъпка по стъпка, с фокус върху най-важното за изпита.',
  },
  {
    title: 'Видео съдържание',
    body: 'Уроците помагат за по-лесно разбиране и запомняне. Когато гледаш и слушаш едновременно, усвояваш материала по-трайно.',
  },
  {
    title: 'Тестове след уроците',
    body: 'Учениците могат веднага да проверят знанията си. Практиката след теорията е най-бързият начин да затвърдиш наученото.',
  },
  {
    title: 'Ясна структура',
    body: 'Подготовката е подредена така, че ученикът да знае какво е минал и какво му остава. Без лутане, без объркване.',
  },
]

const forWhom = [
  'Ясни видео уроци по всяка тема',
  'Структурирани учебни материали',
  'Интерактивни тестове с обратна връзка',
  'По-лесно запомняне на материала',
  'По-добра организация на подготовката',
  'По-голяма увереност преди изпита',
]

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPageSchema} />
      <Header />

      <main>
        {/* Hero */}
        <section
          className="relative overflow-hidden pt-24 pb-14 md:pt-32 md:pb-20"
          style={{ background: 'linear-gradient(90deg, #f0efff 0%, #d9f0ff 55%, #edf9f3 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#E0EDF8] text-[#335C81] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">За нас</span>
                <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-[2.85rem] font-extrabold text-[#1B2845] mb-5">
                  За MaturaHelp
                </h1>
                <p className="text-[#5899E2] text-lg sm:text-xl font-semibold mb-4">
                  По-ясна и структурирана подготовка за НВО и ДЗИ
                </p>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-6 max-w-md mx-auto md:mx-0">
                  MaturaHelp е образователна платформа, която помага на учениците да се подготвят по-лесно,
                  по-организирано и по-уверено за НВО и ДЗИ.
                </p>
                <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Платформата събира най-важните теми, видео уроци и интерактивни тестове на едно място,
                  за да може подготовката да бъде по-разбираема и по-малко стресираща.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link
                    href="/register"
                    className="inline-block text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200 text-center"
                    style={{ background: 'linear-gradient(135deg, #5899E2 0%, #335C81 100%)' }}
                  >
                    Започни подготовката
                  </Link>
                  <Link
                    href="/nvo"
                    className="inline-block border border-[#5899E2] text-[#5899E2] hover:bg-[#F0F6FC] font-semibold px-8 py-3.5 rounded-full text-sm transition-all text-center"
                  >
                    Разгледай уроците
                  </Link>
                </div>
              </div>

              {/* Graduate image with stat card */}
              <div className="relative flex justify-center mt-6 md:mt-0">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  <div className="w-full h-full rounded-full bg-white" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <img
                    src="/brand/hero-graduate.webp"
                    alt="Ученичка с диплома — MaturaHelp"
                    className="absolute inset-0 w-full h-full object-contain z-10"
                    loading="eager"
                    decoding="async"
                  />
                  <div
                    className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 z-20"
                    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1B2845]">НВО и ДЗИ</p>
                      <p className="text-[10px] text-gray-400">Подредена подготовка</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Какво правим — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-6">Какво правим</h2>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
                  В MaturaHelp учебният материал е представен по ясен, кратък и достъпен начин.
                </p>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
                  Видео уроците помагат на учениците да разберат най-важното по всяка тема, без да губят
                  време в търсене на информация от различни източници.
                </p>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  След уроците учениците могат да затвърдят знанията си чрез интерактивни тестове и
                  да проверят доколко са усвоили материала.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '🎬', title: 'Видео уроци', body: 'Кратки и ясни обяснения по всяка тема от програмата.' },
                  { icon: '📝', title: 'Интерактивни тестове', body: 'Практика с официален формат и незабавна обратна връзка.' },
                  { icon: '📚', title: 'Структурирана програма', body: 'Подреден учебен план — знаеш какво е минато и какво следва.' },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-white"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                  >
                    <span className="text-2xl flex-shrink-0">{card.icon}</span>
                    <div>
                      <h3 className="font-bold text-[#1B2845] mb-1">{card.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{card.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Защо съществува — section-bg-light */}
        <section
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-8">Защо съществува MaturaHelp</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-5">
              Подготовката за важни изпити често е объркваща. Учениците се сблъскват с много информация,
              различни материали, дълги обяснения и липса на ясен план.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-5">
              MaturaHelp решава този проблем, като подрежда подготовката в лесен за следване формат.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Целта е ученикът да знае какво да учи, откъде да започне и как да напредва стъпка по стъпка.
            </p>
          </div>
        </section>

        {/* За кого — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-6">За кого е платформата</h2>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                  MaturaHelp е подходяща за ученици, които се подготвят за НВО или ДЗИ и искат по-ясен,
                  по-организиран начин за учене. Платформата е полезна и за родители, които търсят
                  структурирана подготовка за детето си.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {forWhom.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: '#E0EDF8' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="#5899E2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              >
                <img
                  src="/nvo-literature/pod-igoto-predstavlenieto.jpg"
                  alt="Учебни материали за подготовка"
                  className="w-full h-64 md:h-72 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Нашият подход — section-bg-light */}
        <section
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-10 text-center">Нашият подход</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {approach.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-7"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                >
                  <h3 className="text-base font-bold text-[#1B2845] mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Нашата мисия — white */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-6">Нашата мисия</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
              Мисията на MaturaHelp е да направи подготовката за НВО и ДЗИ по-достъпна, по-ясна и по-ефективна.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Искаме всеки ученик да има възможност да се подготвя спокойно, с подреден материал и с
              увереност, че върви в правилната посока.
            </p>
          </div>
        </section>

        {/* Final CTA — cta-gradient */}
        <section
          className="py-16 md:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #5899E2 0%, #335C81 50%, #274060 100%)' }}
        >
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Подготви се по-умно с MaturaHelp
            </h2>
            <p className="text-[#C5DDF1] text-[15px] leading-relaxed mb-10 max-w-xl mx-auto">
              Учи с кратки видео уроци, упражнявай се с интерактивни тестове и следвай ясна структура до изпита.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-block bg-white text-[#335C81] font-semibold px-10 py-4 rounded-full text-sm hover:shadow-xl transition-all"
              >
                Започни подготовката
              </Link>
              <Link
                href="/nvo"
                className="inline-block border border-white text-white font-semibold px-10 py-4 rounded-full text-sm hover:bg-white/10 transition-all"
              >
                Разгледай уроците
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
