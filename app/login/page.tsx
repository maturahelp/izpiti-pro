'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setStoredUser } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setStoredUser(name.trim())
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#1B4FD8" strokeWidth="1.6" strokeLinejoin="round" fill="white"/>
            <path d="M14 8V23" stroke="#1B4FD8" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#1B4FD8" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-text text-lg font-serif">MaturaHelp</span>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold font-serif text-text mb-1">Вход</h1>
          <p className="text-sm text-text-muted mb-6">Въведи името си, за да продължиш</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Твоето име</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Петров"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Влез в платформата
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          <Link href="/" className="hover:text-primary">← Обратно към началото</Link>
        </p>
      </div>
    </div>
  )
}
