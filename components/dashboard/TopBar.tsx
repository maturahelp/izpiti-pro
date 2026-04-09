'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'
import { useGrade } from '@/lib/grade-context'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  const [userName, setUserName] = useState('')
  const { grade, setGrade } = useGrade()

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || ''
        setUserName(name)
      }
    }).catch(() => {})
  }, [])

  const initials = userName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text text-base">{title}</h1>

      {/* Grade toggle */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100 rounded-full p-0.5">
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
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/subscription"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-light border border-amber/20 text-amber text-xs font-semibold hover:bg-amber/20 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Надгради до Премиум
        </Link>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{initials || '?'}</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-text">
            {userName.split(' ')[0] || ''}
          </span>
        </Link>
      </div>
    </header>
  )
}
