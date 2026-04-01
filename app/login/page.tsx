'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setStoredUser } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    const name = email.split('@')[0]
    setStoredUser(name)
    router.push('/dashboard')
  }

  const handleGoogle = () => {
    setStoredUser('Потребител')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#4f7df3" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M14 8V23" stroke="#4f7df3" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#4f7df3" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#4f7df3" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#4f7df3" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#4f7df3" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-white text-lg tracking-tight">ИзпитиПро</span>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoFocus
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Парола"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full py-3 bg-white hover:bg-white/90 text-black font-medium text-sm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Вход
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">или</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-3 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Вход с Google
          </button>

          <p className="text-center text-sm text-white/30 mt-6">
            Нямаш акаунт?{' '}
            <Link href="#" className="text-white/60 hover:text-white underline underline-offset-2 transition-colors">
              Регистрация
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          <Link href="/" className="hover:text-white/40 transition-colors">← Обратно към началото</Link>
        </p>
      </div>
    </div>
  )
}
