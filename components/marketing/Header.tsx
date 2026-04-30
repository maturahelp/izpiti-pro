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

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  )
}

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
              <InstagramIcon size={18} />
            </a>
            <a href="https://www.tiktok.com/@maturahelpbg" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-1.5 text-white/40 hover:text-white transition-colors duration-150">
              <TikTokIcon size={18} />
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
                  <InstagramIcon size={16} />
                  Instagram
                </a>
                <a href="https://www.tiktok.com/@maturahelpbg" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors duration-150">
                  <TikTokIcon size={16} />
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
