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
  const { grade, setGrade, lockedGrade, availableGrades } = useGrade()
  const { preferences, isHydrated } = useNotificationPreferences()
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const notificationsPanelRef = useRef<HTMLDivElement>(null)
  const effectiveGrade = lockedGrade ?? grade

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

    const timeoutId = window.setTimeout(() => {
      try {
        const lastSeen = Number(window.localStorage.getItem(NOTIFICATIONS_SEEN_KEY) || '0')
        const shouldShowUnread =
          notificationItems.length > 0 && (!lastSeen || Date.now() - lastSeen > 12 * 60 * 60 * 1000)
        setHasUnreadNotifications(shouldShowUnread)
      } catch {
        setHasUnreadNotifications(notificationItems.length > 0)
      }
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
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
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1
        className="font-semibold text-text text-base truncate max-w-[40%] sm:max-w-[28%] md:max-w-[22%] pr-2"
        title={title}
      >
        {title}
      </h1>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100 rounded-full p-0.5">
        {availableGrades.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setGrade(option)}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
              effectiveGrade === option
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {option} клас
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            ref={notificationButtonRef}
            type="button"
            onClick={toggleNotifications}
            aria-expanded={isNotificationsOpen}
            aria-label="Известия"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>

          {isNotificationsOpen && (
            <div
              ref={notificationsPanelRef}
              className="absolute right-0 mt-2 w-[320px] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
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

        <a href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{initials || '?'}</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-text">
            {userName.split(' ')[0] || ''}
          </span>
        </a>
      </div>
    </header>
  )
}
