'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NavDrawerButton } from '@/components/marketing/NavDrawer'
import { BrandLogo } from '@/components/shared/BrandLogo'

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
              <BrandLogo className="h-9 w-9" />
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
            <a href="https://www.instagram.com/maturahelp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-1.5 text-white/40 hover:text-white transition-colors duration-150">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@maturahelpbg" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-1.5 text-white/40 hover:text-white transition-colors duration-150">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.65a8.16 8.16 0 0 0 4.77 1.52V7.72a4.85 4.85 0 0 1-1.01-.03z"/>
              </svg>
            </a>
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
              <div className="flex items-center gap-4 justify-center pt-1">
                <a href="https://www.instagram.com/maturahelp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors duration-150">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://www.tiktok.com/@maturahelpbg" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors duration-150">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.65a8.16 8.16 0 0 0 4.77 1.52V7.72a4.85 4.85 0 0 1-1.01-.03z"/>
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
