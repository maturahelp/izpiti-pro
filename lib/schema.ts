export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.maturahelp.com/#organization',
  name: 'MaturaHelp',
  url: 'https://www.maturahelp.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.maturahelp.com/brand/maturahelp-logo.png',
  },
  description: 'Интерактивна платформа за подготовка за НВО и ДЗИ.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@maturahelp.com',
  },
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.maturahelp.com/#website',
  name: 'MaturaHelp',
  url: 'https://www.maturahelp.com',
  inLanguage: 'bg',
  publisher: { '@id': 'https://www.maturahelp.com/#organization' },
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MaturaHelp',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  inLanguage: 'bg',
  offers: [
    { '@type': 'Offer', name: 'НВО Месечен', price: '30.00', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'НВО до края на изпитите', price: '30.00', priceCurrency: 'EUR', priceValidUntil: '2026-06-19' },
    { '@type': 'Offer', name: 'ДЗИ Месечен', price: '30.00', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'ДЗИ до края на матурите', price: '19.99', priceCurrency: 'EUR', priceValidUntil: '2026-05-22' },
  ],
}

export const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
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
