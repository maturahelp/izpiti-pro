import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MaturaHelp — Подготовка за НВО и ДЗИ',
  description: 'Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци, учебни материали и AI помощник.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
