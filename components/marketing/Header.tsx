// components/marketing/Header.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '#hero', label: 'Начало' },
  { href: '#pricing', label: 'Пакети' },
  { href: '#how-it-works', label: 'Как работи' },
  { href: '#faq', label: 'ЧЗВ' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`absolute top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, fontSize: '1.25rem' }}>
            <span style={{ color: '#0F172A' }}>Matura</span>
            <span style={{ color: '#3b82f6' }}>Help</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#1e2a4a] hover:text-blue-600 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/login" className="text-sm font-medium text-[#1e2a4a] hover:text-blue-600 transition">
            Вход
          </Link>
          <Link
            href="/register"
            className="text-white text-sm font-semibold px-6 py-2.5 rounded-full transition hover:shadow-lg"
            style={{ background: '#3b82f6' }}
          >
            Регистрация
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mx-6 rounded-2xl bg-white/80 backdrop-blur-sm p-4 space-y-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-[#1e2a4a]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <Link href="/login" className="text-sm font-medium text-[#1e2a4a]" onClick={() => setMenuOpen(false)}>
              Вход
            </Link>
            <Link
              href="/register"
              className="text-white text-sm font-semibold px-6 py-2.5 rounded-full"
              style={{ background: '#3b82f6' }}
              onClick={() => setMenuOpen(false)}
            >
              Регистрация
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
