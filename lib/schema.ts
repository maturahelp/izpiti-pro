const BASE = 'https://www.maturahelp.com'
const ORG_ID = `${BASE}/#organization`
const SITE_ID = `${BASE}/#website`

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'MaturaHelp',
  url: BASE,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE}/brand/maturahelp-logo.png`,
  },
  description: 'Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци, учебни материали и AI помощник.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@maturahelp.com',
  },
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: 'MaturaHelp',
  url: BASE,
  inLanguage: 'bg',
  publisher: { '@id': ORG_ID },
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MaturaHelp',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  inLanguage: 'bg',
  url: BASE,
  publisher: { '@id': ORG_ID },
  offers: [
    {
      '@type': 'Offer',
      name: 'НВО Месечен план',
      price: '30.00',
      priceCurrency: 'EUR',
      description: 'Месечен достъп до подготовка за НВО',
      url: `${BASE}/#pricing`,
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'НВО до края на изпитите',
      price: '30.00',
      priceCurrency: 'EUR',
      priceValidUntil: '2026-06-19',
      description: 'Достъп до НВО подготовката до края на изпитите',
      url: `${BASE}/#pricing`,
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'ДЗИ Месечен план',
      price: '30.00',
      priceCurrency: 'EUR',
      description: 'Месечен достъп до подготовка за ДЗИ',
      url: `${BASE}/#pricing`,
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'ДЗИ до края на матурите',
      price: '19.99',
      priceCurrency: 'EUR',
      priceValidUntil: '2026-05-22',
      description: 'Достъп до ДЗИ подготовката до края на матурите',
      url: `${BASE}/#pricing`,
      availability: 'https://schema.org/InStock',
    },
  ],
}

// FAQ content mirrors components/marketing/FAQ.tsx — keep in sync when FAQ copy changes
export const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  url: `${BASE}/#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'За кого е платформата?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Платформата е създадена за ученици, които се подготвят за НВО след 7. клас и ДЗИ след 12. клас. Съдържанието е организирано така, че да помага ясно, подредено и по изпитен формат.',
      },
    },
    {
      '@type': 'Question',
      name: 'Какво включва абонаментът?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Според избрания план получаваш достъп до видео уроци, учебни материали, тестове, задачи и AI помощник, който помага с обяснения и насоки по време на подготовката.',
      },
    },
    {
      '@type': 'Question',
      name: 'Колко време важи достъпът?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Това зависи от избрания план. Някои планове са с достъп за 1 месец, а други са валидни до края на изпитния период.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как помага AI помощникът?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI помощникът може да ти обяснява трудни теми, да ти помага при грешки и да те насочва какво да преговориш.',
      },
    },
    {
      '@type': 'Question',
      name: 'Подходяща ли е платформата за последна подготовка преди изпита?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да. Платформата е полезна както за дългосрочна подготовка, така и за интензивно преговаряне преди изпита.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как да избера правилния план?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ако се готвиш за НВО, избери НВО план. Ако се готвиш за ДЗИ, избери ДЗИ план. Ако искаш достъп само за кратък период, избери месечен план, а ако искаш спокойствие до самия изпит, избери плана до края на изпитите.',
      },
    },
  ],
}
