'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getUser } from '@/lib/auth'
import { useGrade } from '@/lib/grade-context'
import { useNotificationPreferences } from '@/lib/use-notification-preferences'
import { getUserDisplayName } from '@/lib/user-display'

interface TopBarProps {
  title: string
}

const NOTIFICATIONS_SEEN_KEY = 'izpiti-pro:topbar-notifications:last-seen:v1'

export function TopBar({ title }: TopBarProps) {
  const [userName, setUserName] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
  const { grade, setGrade } = useGrade()
  const { preferences, isHydrated } = useNotificationPreferences()
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const notificationsPanelRef = useRef<HTMLDivElement>(null)

  const notificationItems = useMemo(() => {
    const items: Array<{
      id: string
      title: string
      description: string
      href: string
    }> = []

    if (preferences.newTests) {
      items.push({
        id: 'new-tests',
        title: 'Нови тестове и практика',
        description: 'Отвори тестовете и виж последните варианти за твоя клас.',
        href: '/dashboard/tests',
      })
    }

    if (preferences.weeklyReport) {
      items.push({
        id: 'weekly-report',
        title: 'Седмичен отчет за напредъка',
        description: 'Провери прогреса си и темите, които искат още внимание.',
        href: '/dashboard/progress',
      })
    }

    if (preferences.promotions) {
      items.push({
        id: 'offers',
        title: 'Абонамент и нови оферти',
        description: 'Виж текущите планове и предложения за подготовка.',
        href: '/dashboard/subscription',
      })
    }

    return items
  }, [preferences])

  useEffect(() => {
    getUser().then((user) => {
      setUserName(getUserDisplayName(user))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    try {
      const lastSeen = Number(window.localStorage.getItem(NOTIFICATIONS_SEEN_KEY) || '0')
      const shouldShowUnread = notificationItems.length > 0 && (!lastSeen || Date.now() - lastSeen > 12 * 60 * 60 * 1000)
      setHasUnreadNotifications(shouldShowUnread)
    } catch {
      setHasUnreadNotifications(notificationItems.length > 0)
    }
  }, [isHydrated, notificationItems.length])

  useEffect(() => {
    if (!isNotificationsOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        notificationsPanelRef.current?.contains(target) ||
        notificationButtonRef.current?.contains(target)
      ) {
        return
      }

      setIsNotificationsOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isNotificationsOpen])

  const initials = userName.split(' ').filter(Boolean).map((name) => name[0]).join('').slice(0, 2).toUpperCase()

  function markNotificationsSeen() {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(NOTIFICATIONS_SEEN_KEY, String(Date.now()))
    setHasUnreadNotifications(false)
  }

  function toggleNotifications() {
    setIsNotificationsOpen((current) => {
      const next = !current

      if (next) {
        markNotificationsSeen()
      }

      return next
    })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="px-4 sm:px-6">
        <div className="flex min-h-14 items-center justify-between gap-3 py-3 sm:py-0">
          <h1
            className="min-w-0 flex-1 truncate pr-2 text-base font-semibold text-text sm:max-w-[35%] md:max-w-[22%]"
            title={title}
          >
            {title}
          </h1>

          <div className="hidden flex-1 justify-center sm:flex">
            <div className="flex items-center rounded-full bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => setGrade('7')}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                  grade === '7'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                7 клас
              </button>
              <button
                type="button"
                onClick={() => setGrade('12')}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                  grade === '12'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                12 клас
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div className="relative">
              <button
                ref={notificationButtonRef}
                type="button"
                onClick={toggleNotifications}
                aria-expanded={isNotificationsOpen}
                aria-label="Известия"
                className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {hasUnreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  ref={notificationsPanelRef}
                  className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
                >
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-text">Известия</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Бързи преки пътища според настройките ти.
                    </p>
                  </div>

                  <div className="p-2">
                    {notificationItems.length > 0 ? (
                      notificationItems.map((item) => (
                        <a
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
                        >
                          <p className="text-sm font-medium text-text">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-text-muted">{item.description}</p>
                        </a>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <p className="text-sm font-medium text-text">Няма активни известия</p>
                        <p className="mt-1 text-xs leading-5 text-text-muted">
                          Включи категории от Настройки, за да виждаш тук преки пътища и напомняния.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border p-2">
                    <a
                      href="/dashboard/settings"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-light/40"
                    >
                      Управлявай известията
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="/dashboard/profile"
              aria-label="Отвори профила"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light">
                <span className="text-xs font-bold text-primary">{initials || '?'}</span>
              </div>
              <span className="hidden text-sm font-medium text-text sm:block">
                {userName.split(' ')[0] || ''}
              </span>
            </a>
          </div>
        </div>

        <div className="pb-3 sm:hidden">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setGrade('7')}
              className={`rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                grade === '7'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              7 клас
            </button>
            <button
              type="button"
              onClick={() => setGrade('12')}
              className={`rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                grade === '12'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              12 клас
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
