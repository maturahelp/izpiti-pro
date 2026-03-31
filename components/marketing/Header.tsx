'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#kak-raboti', label: 'Как работи' },
  { href: '#izpiti', label: 'Изпити' },
  { href: '#ceni', label: 'Цени' },
  { href: '#chesto-zadavani-vaprosi', label: 'ЧЗВ' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm font-serif">И</span>
            </span>
            <span className="font-bold text-text text-lg font-serif">ИзпитиПро</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-gray-50 rounded-lg transition-colors"
            >
              Начало
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              Вход
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm">
              Започни безплатно
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
          <Link href="/" className="px-3 py-2.5 text-sm font-medium text-text hover:bg-gray-50 rounded-lg">
            Начало
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:bg-gray-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-1 flex flex-col gap-2">
            <Link href="/dashboard" className="btn-secondary text-sm justify-center">
              Вход
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm justify-center">
              Започни безплатно
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
