'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
        'sticky top-0 z-50 bg-[#0F172A] transition-all duration-200',
        scrolled ? 'border-b border-[#1E293B]' : 'border-b border-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <NavDrawerButton />
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#2563EB" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
                <path d="M14 8V23" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8 11C9.5 10.7 11 10.6 12.5 10.8" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M8 13.5C9.5 13.2 11 13.1 12.5 13.3" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 10.8C17 10.6 18.5 10.7 20 11" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 13.3C17 13.1 18.5 13.2 20 13.5" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="font-extrabold text-white text-[16px] tracking-[-0.03em]">MaturaHelp</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3.5 py-2 text-[13.5px] font-medium text-white/50 hover:text-white transition-colors duration-150">
              Начало
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-[13.5px] font-medium text-white/50 hover:text-white transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[13.5px] font-medium text-white/50 hover:text-white transition-colors duration-150">
              Вход
            </Link>
            <Link href="/register"
              className="px-5 py-2 bg-[#2563EB] text-white text-[13.5px] font-bold rounded-full hover:bg-[#1d4ed8] transition-colors duration-150 shadow-[0_2px_12px_rgba(37,99,235,0.4)]">
              Започни безплатно
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors duration-150"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
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
            transition={{ duration: 0.15 }}
            className="md:hidden border-t border-[#1E293B] bg-[#0F172A] px-5 py-4 flex flex-col gap-1"
          >
            <Link href="/" className="px-3 py-2.5 text-[13.5px] font-medium text-white hover:bg-white/[0.06] rounded transition-colors">Начало</Link>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-3 py-2.5 text-[13.5px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded transition-colors" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#1E293B] mt-2 flex flex-col gap-2">
              <Link href="/login" className="py-2.5 text-center text-[13.5px] font-medium text-white/60 border border-white/10 rounded-[6px] hover:bg-white/[0.06] transition-colors" onClick={() => setMenuOpen(false)}>Вход</Link>
              <Link href="/register" className="py-2.5 text-center text-[13.5px] font-bold text-white bg-[#2563EB] rounded-full hover:bg-[#1d4ed8] transition-colors">Започни безплатно</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
