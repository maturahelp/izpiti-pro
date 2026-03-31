import type { Metadata } from 'next'
import { Lora, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-lora',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ИзпитиПро — Подготовка за НВО и ДЗИ',
  description: 'Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци, учебни материали и AI помощник.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" className={`${lora.variable} ${plusJakarta.variable}`}>
      <body>{children}</body>
    </html>
  )
}
