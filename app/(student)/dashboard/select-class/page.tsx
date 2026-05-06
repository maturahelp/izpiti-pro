'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Grade = '7' | '12'

function safeRedirectTo(raw: string | null): string {
  if (!raw) return '/dashboard/materials'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard/materials'
  return raw
}

export default function SelectClassPage() {
  return (
    <Suspense fallback={null}>
      <SelectClassForm />
    </Suspense>
  )
}

function SelectClassForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectTo(searchParams.get('redirectTo'))
  const [selected, setSelected] = useState<Grade | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // If the user already has a class set, skip this page.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return
        if (!user) {
          router.replace('/login')
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single()
        if (cancelled) return
        if (profile?.class === '7' || profile?.class === '12') {
          router.replace(redirectTo)
          return
        }
        setChecking(false)
      } catch {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => { cancelled = true }
  }, [router, redirectTo])

  async function handleSave() {
    if (!selected) { setError('Избери за какъв изпит се подготвяш.'); return }
    setError(null)
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ class: selected, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (updateError) {
        setSaving(false)
        setError('Неуспешен запис. Опитай пак.')
        return
      }
      try { localStorage.setItem('grade', selected) } catch {}
      window.location.href = redirectTo
    } catch {
      setSaving(false)
      setError('Възникна грешка. Опитай пак.')
    }
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-[14px] text-text-muted">Зареждане...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] p-6 sm:p-8">
        <h1 className="text-[20px] font-bold text-text tracking-[-0.02em] mb-1.5">
          За какъв изпит се подготвяш?
        </h1>
        <p className="text-[13.5px] text-text-muted mb-5 leading-[1.55]">
          Избери класа си, за да виждаш само материалите, които ти трябват.
          Този избор е важен — ще можеш да го смениш по-късно от настройките.
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setSelected('7')}
            aria-pressed={selected === '7'}
            className={`px-4 py-5 rounded-xl border text-left transition ${
              selected === '7'
                ? 'border-primary bg-primary/[0.06] ring-2 ring-primary/15'
                : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
            }`}
          >
            <div className="text-[15px] font-bold text-text mb-0.5">НВО</div>
            <div className="text-[12px] text-text-muted">7. клас</div>
          </button>
          <button
            type="button"
            onClick={() => setSelected('12')}
            aria-pressed={selected === '12'}
            className={`px-4 py-5 rounded-xl border text-left transition ${
              selected === '12'
                ? 'border-primary bg-primary/[0.06] ring-2 ring-primary/15'
                : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
            }`}
          >
            <div className="text-[15px] font-bold text-text mb-0.5">ДЗИ</div>
            <div className="text-[12px] text-text-muted">12. клас</div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!selected || saving}
          className="w-full py-3 rounded-xl font-semibold text-[14px] text-white bg-gradient-to-r from-primary to-[#2563EB] hover:from-[#1741b8] hover:to-[#1d4ed8] shadow-[0_4px_14px_rgba(27,79,216,0.35)] hover:shadow-[0_6px_20px_rgba(27,79,216,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Запазване...' : 'Продължи'}
        </button>
      </div>
    </div>
  )
}
