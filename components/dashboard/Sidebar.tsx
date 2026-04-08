'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavChild = {
  href: string
  label: string
  icon: JSX.Element
}

type NavItem = {
  href: string
  label: string
  icon: JSX.Element
  children?: NavChild[]
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Табло',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/materials',
    label: 'Материали',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    children: [
      {
        href: '/dashboard/tests',
        label: 'Тестове',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
        ),
      },
      {
        href: '/dashboard/lessons',
        label: 'Аудио уроци',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.5 8.5a5 5 0 010 7" />
          </svg>
        ),
      },
      {
        href: '/dashboard/video-lessons',
        label: 'Видео уроци',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <polygon points="10 8 17 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
        ),
      },
      {
        href: '/dashboard/tables-cards',
        label: 'Таблици и карти',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        ),
      },
    ],
  },
  {
    href: '/dashboard/ai',
    label: 'AI помощник',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
] satisfies NavItem[]

const bottomItems = [
  {
    href: '/dashboard/subscription',
    label: 'Абонамент',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'Профил',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const materialChildHrefs = [
    '/dashboard/tests',
    '/dashboard/lessons',
    '/dashboard/video-lessons',
    '/dashboard/tables-cards',
  ]

  const isMaterialsActive = isActive('/dashboard/materials') || materialChildHrefs.some((href) => pathname.startsWith(href))

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-sidebar flex flex-col z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10 hover:opacity-80 transition-opacity">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#93c5fd" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M14 8V23" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="font-bold text-white text-base font-serif">MaturaHelp</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                item.href === '/dashboard/materials'
                  ? (isMaterialsActive ? 'sidebar-item-active' : 'sidebar-item')
                  : (isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item')
              )}
            >
              {item.icon}
              {item.label}
            </Link>

            {item.href === '/dashboard/materials' && item.children && (
              <div
                className={cn(
                  'ml-7 border-l border-white/10 pl-2 transition-all duration-250 ease-out overflow-hidden',
                  isMaterialsActive ? 'mt-1 max-h-60 opacity-100' : 'mt-0 max-h-0 opacity-0 pointer-events-none'
                )}
              >
                <div className="space-y-0.5 pb-0.5">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors',
                      pathname.startsWith(child.href)
                        ? 'bg-sidebar-hover text-white'
                        : 'text-white/70 hover:text-white hover:bg-sidebar-hover/70'
                    )}
                  >
                    {child.icon}
                    {child.label}
                  </Link>
                ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <Link href="/" className="sidebar-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Начало
        </Link>
      </div>
    </aside>
  )
}
