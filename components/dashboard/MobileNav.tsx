'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const primaryMobileNavItems = [
  {
    href: '/dashboard/progress',
    label: 'Прогрес',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/dashboard/materials',
    label: 'Материали',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/tests',
    label: 'Тестове',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
]

const mobileMoreItems = [
  {
    href: '/dashboard',
    label: 'Табло',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/subscription',
    label: 'Абонамент',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'Профил',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/help',
    label: 'Помощ',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Настройки',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  useEffect(() => {
    setIsMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMoreOpen) return

    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMoreOpen])

  return (
    <>
      {isMoreOpen && (
        <>
          <button
            type="button"
            aria-label="Затвори още менюто"
            className="md:hidden fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="md:hidden fixed inset-x-3 bottom-[calc(4.75rem+max(env(safe-area-inset-bottom),0px))] z-50 rounded-[1.75rem] border border-border bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-text">Още секции</p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Бърз достъп до профил, настройки и всички липсващи действия.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
                aria-label="Затвори"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 p-3">
              {mobileMoreItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary-light text-primary'
                      : 'text-text hover:bg-slate-50'
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-current">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-4 gap-1 px-2 pb-[max(env(safe-area-inset-bottom),0px)] pt-2">
          {primaryMobileNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-light text-primary'
                  : 'text-text-muted hover:bg-slate-50 hover:text-text'
              )}
            >
              {item.icon}
              {item.label}
            </a>
          ))}

          <button
            type="button"
            onClick={() => setIsMoreOpen((current) => !current)}
            aria-expanded={isMoreOpen}
            aria-label="Още секции"
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 text-[10px] font-medium transition-colors',
              isMoreOpen
                ? 'bg-primary-light text-primary'
                : mobileMoreItems.some((item) => isActive(item.href))
                ? 'bg-slate-100 text-text'
                : 'text-text-muted hover:bg-slate-50 hover:text-text'
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
            Още
          </button>
        </div>
      </nav>
    </>
  )
}
