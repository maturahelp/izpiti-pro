'use client'

import { useEffect, useState } from 'react'

export type NotificationPreferenceKey = 'newTests' | 'weeklyReport' | 'promotions'

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>

export const notificationPreferenceOptions = [
  { key: 'newTests', label: 'Нови тестове и ресурси' },
  { key: 'weeklyReport', label: 'Седмичен отчет за прогреса' },
  { key: 'promotions', label: 'Промоции и новини' },
] as const

export const defaultNotificationPreferences: NotificationPreferences = {
  newTests: true,
  weeklyReport: true,
  promotions: false,
}

const STORAGE_KEY = 'izpiti-pro:notification-preferences:v1'

function getBooleanPreference(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

export function readNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultNotificationPreferences

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultNotificationPreferences

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>

    return {
      newTests: getBooleanPreference(parsed.newTests, defaultNotificationPreferences.newTests),
      weeklyReport: getBooleanPreference(parsed.weeklyReport, defaultNotificationPreferences.weeklyReport),
      promotions: getBooleanPreference(parsed.promotions, defaultNotificationPreferences.promotions),
    }
  } catch {
    return defaultNotificationPreferences
  }
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setPreferences(readNotificationPreferences())
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const syncPreferences = () => {
      setPreferences(readNotificationPreferences())
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== STORAGE_KEY) return
      syncPreferences()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('notification-preferences:changed', syncPreferences)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('notification-preferences:changed', syncPreferences)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    window.dispatchEvent(new Event('notification-preferences:changed'))
  }, [isHydrated, preferences])

  return {
    preferences,
    setPreferences,
    isHydrated,
  }
}
