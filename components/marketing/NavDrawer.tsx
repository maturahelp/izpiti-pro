'use client'

import Link from 'next/link'
import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signUp, signOut, getUser } from '@/lib/auth'

// ── Context ───────────────────────────────────────────────────────────────────
interface DrawerCtxType {
  open: boolean
  setOpen: (v: boolean) => void
  loginGate: boolean
  openLoginGate: () => void
  closeLoginGate: () => void
  activeHref: string
  setActiveHref: (v: string) => void
}

const DrawerCtx = createContext<DrawerCtxType>({
  open: false, setOpen: () => {},
  loginGate: false, openLoginGate: () => {}, closeLoginGate: () => {},
  activeHref: '/dashboard', setActiveHref: () => {},
})

export function NavDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loginGate, setLoginGate] = useState(false)
  const [activeHref, setActiveHref] = useState('/')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setLoginGate(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (open || loginGate) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open, loginGate])

  return (
    <DrawerCtx.Provider value={{
      open, setOpen,
      loginGate, openLoginGate: () => setLoginGate(true), closeLoginGate: () => setLoginGate(false),
      activeHref, setActiveHref,
    }}>
      {children}
    </DrawerCtx.Provider>
  )
}

// ── Hamburger button ──────────────────────────────────────────────────────────
export function NavDrawerButton() {
  const { setOpen } = useContext(DrawerCtx)
  return (
    <button
      onClick={() => setOpen(true)}
      className="flex flex-col justify-center gap-[5px] w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors p-1.5 flex-shrink-0"
      aria-label="Отвори меню"
    >
      <span className="block w-full h-[1.5px] bg-text rounded-full" />
      <span className="block w-[70%] h-[1.5px] bg-text rounded-full" />
      <span className="block w-full h-[1.5px] bg-text rounded-full" />
    </button>
  )
}

// ── Links data ────────────────────────────────────────────────────────────────
const mainLinks = [
  { href: '/dashboard', label: 'Табло', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: '/dashboard/tests', label: 'Тестове', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12l2 2 4-4"/></svg> },
  { href: '/dashboard/materials', label: 'Материали', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
  { href: '/dashboard/ai', label: 'AI помощник', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/dashboard/progress', label: 'Напредък', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
]

const bottomLinks = [
  { href: '/dashboard/subscription', label: 'Абонамент', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { href: '/dashboard/profile', label: 'Профил', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

// ── Drawer panel ──────────────────────────────────────────────────────────────
export function NavDrawerPanel() {
  const { open, setOpen, openLoginGate, activeHref, setActiveHref } = useContext(DrawerCtx)
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    getUser().then(u => setIsLoggedIn(!!u))
  }, [open])

  async function handleSignOut() {
    await signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  function handleProtectedLink(href: string) {
    setActiveHref(href)
    setOpen(false)
    openLoginGate()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

          <motion.div key="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed top-0 left-0 h-full w-[260px] z-[210] bg-sidebar flex flex-col">

            <div className="flex items-center gap-2.5 px-5 h-[64px] border-b border-white/[0.07] flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#93C5FD" strokeWidth="1.6" strokeLinejoin="round" fill="transparent"/>
                <path d="M14 8V23" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#93C5FD" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#93C5FD" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#93C5FD" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#93C5FD" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="font-bold text-white text-[16px] tracking-[-0.02em]">MaturaHelp</span>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
              {mainLinks.map((link) => (
                <button key={link.href} onClick={() => handleProtectedLink(link.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 text-left ${activeHref === link.href ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
                  <span className="flex-shrink-0">{link.icon}</span>
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="px-3 pb-5 border-t border-white/[0.07] pt-3 flex flex-col gap-0.5">
              {bottomLinks.map((link) => (
                <button key={link.href} onClick={() => handleProtectedLink(link.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 text-left ${activeHref === link.href ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
                  <span className="flex-shrink-0">{link.icon}</span>
                  {link.label}
                </button>
              ))}
              <Link href="/" onClick={() => { setActiveHref('/'); setOpen(false) }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 ${activeHref === '/' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
                <span className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">N</span>
                Начало
              </Link>

              {isLoggedIn && (
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-150 text-left mt-1 border-t border-white/[0.07] pt-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Излез от профила
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Login Gate Modal ──────────────────────────────────────────────────────────
export function LoginGateModal() {
  const { loginGate, closeLoginGate, activeHref } = useContext(DrawerCtx)
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function resetForm() {
    setEmail(''); setPassword(''); setName(''); setConfirmPassword(''); setError(null); setInfo(null)
  }

  function handleTabChange(t: 'login' | 'register') {
    setTab(t); resetForm()
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Попълни имейл и парола.'); return }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      const msg = error.message?.includes('Email not confirmed')
        ? 'Имейлът не е потвърден. Провери пощата си.'
        : 'Грешен имейл или парола.'
      setError(msg)
      return
    }
    closeLoginGate()
    router.push(activeHref || '/dashboard')
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Попълни всички полета.'); return }
    if (password.length < 8) { setError('Паролата трябва да е поне 8 знака.'); return }
    if (password !== confirmPassword) { setError('Паролите не съвпадат.'); return }
    setLoading(true)
    const { session, error } = await signUp(email, password, name)
    setLoading(false)
    if (error) { setError(error.message); return }
    if (session) {
      closeLoginGate()
      router.push(activeHref || '/dashboard')
      router.refresh()
    } else {
      setInfo('Акаунтът е създаден! Провери имейла си и кликни линка за потвърждение, за да влезеш.')
    }
  }

  return (
    <AnimatePresence>
      {loginGate && (
        <>
          <motion.div key="gate-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[300] bg-white/30 backdrop-blur-md" onClick={closeLoginGate} />

          <motion.div key="gate-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed inset-0 z-[310] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_24px_64px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] pointer-events-auto">

              <div className="flex justify-end px-5 pt-4">
                <button onClick={closeLoginGate} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="px-7 pb-7 pt-1">
                <div className="flex items-center gap-2.5 justify-center mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/[0.08] border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                      <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#2F4E85" strokeWidth="1.6" strokeLinejoin="round" fill="white"/>
                      <path d="M14 8V23" stroke="#2F4E85" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="font-bold text-text text-[18px] tracking-[-0.02em]">MaturaHelp</span>
                </div>

                <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-5">
                  <button onClick={() => handleTabChange('login')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
                    Влез
                  </button>
                  <button onClick={() => handleTabChange('register')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${tab === 'register' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
                    Регистрирай се
                  </button>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
                    {error}
                  </div>
                )}
                {info && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[13px] text-blue-700">
                    {info}
                  </div>
                )}

                {tab === 'login' ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имейл адрес</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Въведи своя имейл"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12.5px] font-semibold text-text">Парола</label>
                        <Link href="/forgot-password" className="text-[12px] text-primary hover:underline">Забравена парола?</Link>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-14 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-muted hover:text-text transition">
                          {showPassword ? 'Скрий' : 'Покажи'}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="block w-full text-center py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] transition-all duration-200 mb-4 disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? 'Влизане...' : 'Влез в акаунта'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имe (по избор)</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Твоето име"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-[12.5px] font-semibold text-text mb-1.5">Имейл адрес</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Въведи своя имейл"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/50 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-[12.5px] font-semibold text-text mb-1.5">Парола</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="Минимум 8 знака"
                          className="w-full px-4 py-2.5 pr-14 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-muted hover:text-text transition">
                          {showPassword ? 'Скрий' : 'Покажи'}
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[12.5px] font-semibold text-text mb-1.5">Потвърди паролата</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Повтори паролата"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13.5px] text-text placeholder:text-text-muted/40 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                    </div>
                    <button type="submit" disabled={loading}
                      className="block w-full text-center py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] transition-all duration-200 mb-4 disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? 'Създаване...' : 'Създай акаунт'}
                    </button>
                  </form>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                  <span className="text-[12px] text-text-muted/60">или продължи с</span>
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-text transition">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-text transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    Apple
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
