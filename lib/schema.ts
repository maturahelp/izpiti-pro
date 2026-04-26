export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://www.maturahelp.com/#organization',
  name: 'MaturaHelp',
  url: 'https://www.maturahelp.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.maturahelp.com/brand/maturahelp-logo.png',
  },
  description: 'Образователна платформа за подготовка за НВО (7 клас) и ДЗИ (12 клас) в България. 500+ теста, видео уроци и AI помощник.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@maturahelp.com',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Абонаментни планове за НВО и ДЗИ',
  },
  // sameAs: add social profile URLs here once created (Facebook, Instagram, YouTube, LinkedIn)
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.maturahelp.com/#website',
  name: 'MaturaHelp',
  url: 'https://www.maturahelp.com',
  inLanguage: 'bg',
  publisher: { '@id': 'https://www.maturahelp.com/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.maturahelp.com/dashboard/tests?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
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

// FAQPage schema intentionally removed — restricted to government/healthcare sites since Aug 2023.
// MaturaHelp is a commercial educational platform; this schema produces no Google rich results here.
