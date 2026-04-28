import type { Metadata } from 'next'
import { Manrope, Montserrat } from 'next/font/google'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import Preloader from '@/components/shared/Preloader'
import { brandMetadataIcons } from '@/lib/brand'
import { JsonLd } from '@/components/shared/JsonLd'
import { organizationSchema, websiteSchema } from '@/lib/schema'

const GOOGLE_ANALYTICS_ID = 'G-9LX2CPVD1T'
const META_PIXEL_ID = '1883126002400773'

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-alt',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.maturahelp.com'),
  title: { default: 'MaturaHelp — Подготовка за НВО и ДЗИ', template: '%s | MaturaHelp' },
  description: 'Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци, учебни материали и AI помощник.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: 'https://www.maturahelp.com/',
    siteName: 'MaturaHelp',
    title: 'MaturaHelp — Подготовка за НВО и ДЗИ',
    description: 'Видео уроци, тестове и AI помощник за НВО 7 клас и ДЗИ 12 клас.',
    images: [{ url: '/brand/maturahelp-logo.png', width: 512, height: 512, alt: 'MaturaHelp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaturaHelp — Подготовка за НВО и ДЗИ',
    description: 'Видео уроци, тестове и AI помощник за НВО 7 клас и ДЗИ 12 клас.',
    images: ['/brand/maturahelp-logo.png'],
  },
  icons: brandMetadataIcons,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" className={`${manrope.variable} ${montserrat.variable}`}>
      <body>
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <Preloader />
        {children}
        <Script src="/cookie-consent.js" strategy="afterInteractive" />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
      <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
    </html>
  )
}
