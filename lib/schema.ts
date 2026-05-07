export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://www.maturahelp.com/#organization',
  name: 'MaturaHelp',
  url: 'https://www.maturahelp.com',
  foundingDate: '2024',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.maturahelp.com/brand/maturahelp-logo.png',
    width: 1254,
    height: 1254,
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
  // sameAs: add social profile URLs here once created (Facebook, Instagram, YouTube)
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
      // /dashboard/tests is explicitly allowed in robots.ts so bots can follow this action
      urlTemplate: 'https://www.maturahelp.com/dashboard/tests?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MaturaHelp',
  url: 'https://www.maturahelp.com',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  inLanguage: 'bg',
  // aggregateRating: add once Trustpilot review count is known
  // { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '50', bestRating: '5', worstRating: '1' }
  offers: [
    {
      '@type': 'Offer',
      name: 'НВО Месечен',
      price: '30.00',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: 'https://www.maturahelp.com/#pricing',
    },
    {
      '@type': 'Offer',
      name: 'НВО до края на изпитите',
      price: '30.00',
      priceCurrency: 'EUR',
      priceValidUntil: '2026-06-19',
      availability: 'https://schema.org/InStock',
      url: 'https://www.maturahelp.com/#pricing',
    },
    {
      '@type': 'Offer',
      name: 'ДЗИ Месечен',
      price: '30.00',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: 'https://www.maturahelp.com/#pricing',
    },
    {
      '@type': 'Offer',
      name: 'ДЗИ до края на матурите',
      price: '19.99',
      priceCurrency: 'EUR',
      priceValidUntil: '2026-05-22',
      availability: 'https://schema.org/InStock',
      url: 'https://www.maturahelp.com/#pricing',
    },
  ],
}

// FAQPage schema intentionally removed from homepage — restricted to government/healthcare sites since Aug 2023.
// On subject pages FAQPage is still included for GEO/AI citation value (Perplexity, ChatGPT, AI Overviews).

const BASE = 'https://www.maturahelp.com'

export function makeCourseSchema(opts: {
  url: string
  name: string
  description: string
  educationalLevel: string
  teaches: string[]
  price?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    url: `${BASE}${opts.url}`,
    name: opts.name,
    description: opts.description,
    inLanguage: 'bg',
    educationalLevel: opts.educationalLevel,
    teaches: opts.teaches,
    provider: { '@type': 'EducationalOrganization', '@id': `${BASE}/#organization` },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', inLanguage: 'bg' },
    offers: {
      '@type': 'Offer',
      price: opts.price ?? '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${BASE}/register`,
    },
  }
}

export function makeBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE}${item.url}`,
    })),
  }
}

export function makeFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
