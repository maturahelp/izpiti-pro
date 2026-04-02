'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NavDrawerButton } from '@/components/marketing/NavDrawer'

const navLinks = [
  { href: '#kak-raboti', label: 'Как работи' },
  { href: '#izpiti', label: 'Изпити' },
  { href: '#ceni', label: 'Цени' },
  { href: '#chesto-zadavani-vaprosi', label: 'ЧЗВ' },
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
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-[#E2E8F0]/80 shadow-[0_1px_0_rgba(15,23,42,0.04)]'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <div className="flex items-center justify-between h-[60px]">
          {/* Nav Drawer + Logo */}
          <div className="flex items-center gap-2">
            <NavDrawerButton />
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#1B4FD8" strokeWidth="1.6" strokeLinejoin="round" fill="white"/>
              <path d="M14 8V23" stroke="#1B4FD8" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="font-serif font-bold text-text text-[17px] tracking-[-0.02em]">MaturaHelp</span>
          </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            <Link
              href="/"
              className="px-3.5 py-2 text-[13.5px] font-medium text-text-muted hover:text-text rounded-lg transition-colors duration-150"
            >
              Начало
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-[13.5px] font-medium text-text-muted hover:text-text rounded-lg transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#login"
              className="text-[13.5px] font-medium text-text-muted hover:text-text transition-colors duration-150"
            >
              Вход
            </Link>
            <Link href="/login" className="btn-primary text-[13.5px] px-4 py-2">
              Започни безплатно
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors duration-150"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <motion.div animate={menuOpen ? 'open' : 'closed'}>
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="md:hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl px-5 py-3 flex flex-col gap-0.5"
          >
            <Link href="/" className="px-3 py-2.5 text-[13.5px] font-medium text-text hover:bg-slate-50 rounded-xl transition-colors">
              Начало
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-[13.5px] font-medium text-text-muted hover:text-text hover:bg-slate-50 rounded-xl transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E2E8F0] mt-2 flex flex-col gap-2">
              <Link href="#login" className="btn-secondary text-sm justify-center" onClick={() => setMenuOpen(false)}>
                Вход
              </Link>
              <Link href="/login" className="btn-primary text-sm justify-center">
                Започни безплатно
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
