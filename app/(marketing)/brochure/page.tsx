import type { Metadata } from 'next'
import { BrochurePage } from '@/components/marketing/BrochurePage'

export const metadata: Metadata = {
  title: 'Интерактивна брошура за НВО и ДЗИ',
  description:
    'Разгледай MaturaHelp като интерактивна брошура: видео уроци, теория, тестове и AI помощник за по-ясна подготовка за НВО и ДЗИ.',
  alternates: { canonical: '/brochure' },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: 'https://www.maturahelp.com/brochure',
    siteName: 'MaturaHelp',
    title: 'MaturaHelp — интерактивна брошура за НВО и ДЗИ',
    description:
      'Подредена подготовка за НВО и ДЗИ с видео уроци, теория, тестове и AI помощник в една платформа.',
    images: [{ url: '/brand/maturahelp-logo.png', width: 512, height: 512, alt: 'MaturaHelp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaturaHelp — интерактивна брошура за НВО и ДЗИ',
    description:
      'Подредена подготовка за НВО и ДЗИ с видео уроци, теория, тестове и AI помощник в една платформа.',
    images: ['/brand/maturahelp-logo.png'],
  },
}

export default function Page() {
  return <BrochurePage />
}
