'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/auth'

const EXAM_PATH_OPTIONS = [
  'НВО',
  'НВО — Български език',
  'НВО — Математика',
  'ДЗИ',
  'ДЗИ — Български език и литература',
  'ДЗИ — Математика',
  'ДЗИ — История и цивилизации',
]

type Status = 'idle' | 'saving' | 'saved' | 'error'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [plan, setPlan] = useState<'free' | 'premium' | null>(null)

  const [name, setName] = useState('')
  const [classYear, setClassYear] = useState<'7' | '12' | ''>('')
  const [examPath, setExamPath] = useState<string>('НВО')

  const [profileStatus, setProfileStatus] = useState<Status>('idle')
  const [profileError, setProfileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwStatus, setPwStatus] = useState<Status>('idle')
  const [pwError, setPwError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, class, exam_path, plan')
        .eq('id', user.id)
        .single()
      if (cancelled) return
      setUserId(user.id)
      setUserEmail(user.email ?? '')
      setName(profile?.name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? '')
      setClassYear((profile?.class as '7' | '12' | null) ?? '')
      setExamPath(profile?.exam_path ?? 'НВО')
      setPlan((profile?.plan as 'free' | 'premium' | null) ?? null)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setProfileStatus('saving')
    setProfileError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setProfileStatus('error')
      setProfileError('Името не може да е празно.')
      return
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { name: trimmedName },
    })
    if (updateAuthError) {
      setProfileStatus('error')
      setProfileError('Неуспех при запис. Опитай отново.')
      return
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        name: trimmedName,
        class: classYear === '' ? null : classYear,
        exam_path: examPath,
      })
      .eq('id', userId)

    if (updateProfileError) {
      setProfileStatus('error')
      setProfileError('Неуспех при запис в профила.')
      return
    }

    setProfileStatus('saved')
    setTimeout(() => setProfileStatus('idle'), 2500)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwStatus('saving')
    setPwError(null)

    if (!newPassword || newPassword.length < 8) {
      setPwStatus('error')
      setPwError('Новата парола трябва да е поне 8 знака.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwStatus('error')
      setPwError('Новата парола и потвърждението не съвпадат.')
      return
    }

    // Re-authenticate to verify current password (supabase doesn't require it,
    // but we ask for it in the UI — check by signing in with current password).
    if (currentPassword && userEmail) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      })
      if (verifyError) {
        setPwStatus('error')
        setPwError('Текущата парола е грешна.')
        return
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwStatus('error')
      setPwError('Неуспех при смяна на паролата.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPwStatus('saved')
    setTimeout(() => setPwStatus('idle'), 2500)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Профил" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        {/* Profile header */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary font-serif">
              {initials || '—'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-text">{name || '—'}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`badge text-xs ${plan === 'premium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-text-muted'}`}>
                {plan === 'premium' ? 'Премиум план' : plan === 'free' ? 'Безплатен план' : 'Зареждане...'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <form onSubmit={handleSaveProfile} className="card p-5">
          <h2 className="font-semibold text-text text-sm mb-4">Лична информация</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Пълно име</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                disabled={!loaded}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Имейл адрес</label>
              <input
                type="email"
                value={userEmail}
                className="input-field bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Клас</label>
              <select
                value={classYear}
                onChange={(e) => setClassYear(e.target.value as '7' | '12' | '')}
                className="input-field"
                disabled={!loaded}
              >
                <option value="">Не е избран</option>
                <option value="7">7. клас</option>
                <option value="12">12. клас</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Изпитен път</label>
              <select
                value={EXAM_PATH_OPTIONS.includes(examPath) ? examPath : ''}
                onChange={(e) => setExamPath(e.target.value)}
                className="input-field"
                disabled={!loaded}
              >
                {!EXAM_PATH_OPTIONS.includes(examPath) && examPath && (
                  <option value="">{examPath}</option>
                )}
                {EXAM_PATH_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              className="btn-primary text-sm"
              disabled={profileStatus === 'saving' || !loaded}
            >
              {profileStatus === 'saving' ? 'Записване...' : 'Запази промените'}
            </button>
            {profileStatus === 'saved' && (
              <span className="text-xs text-success font-medium">Запазено.</span>
            )}
            {profileStatus === 'error' && profileError && (
              <span className="text-xs text-danger font-medium">{profileError}</span>
            )}
          </div>
        </form>

        {/* Password */}
        <form onSubmit={handleChangePassword} className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Смяна на парола</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Текуща парола</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Въведи текущата парола"
                className="input-field"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Нова парола</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 8 знака"
                className="input-field"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Потвърди нова парола</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повтори новата парола"
                className="input-field"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              className="btn-secondary text-sm"
              disabled={pwStatus === 'saving'}
            >
              {pwStatus === 'saving' ? 'Смяна...' : 'Смени паролата'}
            </button>
            {pwStatus === 'saved' && (
              <span className="text-xs text-success font-medium">Паролата е сменена.</span>
            )}
            {pwStatus === 'error' && pwError && (
              <span className="text-xs text-danger font-medium">{pwError}</span>
            )}
          </div>
        </form>

        {/* Sign out */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-3 text-sm">Изход</h2>
          <button onClick={handleLogout} className="btn-secondary text-sm justify-center">
            Изход от профила
          </button>
        </div>
      </div>
    </div>
  )
}
