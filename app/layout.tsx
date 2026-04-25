import type { Metadata } from 'next'
import { Manrope, Montserrat } from 'next/font/google'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import Preloader from '@/components/shared/Preloader'
import { brandMetadataIcons } from '@/lib/brand'

const GOOGLE_ANALYTICS_ID = 'G-9J2B53ZH5P'

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
  title: 'MaturaHelp — Подготовка за НВО и ДЗИ',
  description: 'Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци, учебни материали и AI помощник.',
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
        <Preloader />
        {children}
        <Script src="/cookie-consent.js" strategy="afterInteractive" />
      </body>
      <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
    </html>
  )
}
