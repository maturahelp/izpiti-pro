'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  time: string
}

const suggestedPrompts = [
  'Обясни ми тази тема по-лесно',
  'Защо последният ми отговор беше грешен?',
  'Обобщи урока за запетаята накратко',
  'Задай ми подобен въпрос за упражнение',
  'Какво да уча след правописа?',
  'Как се изписват представките из-, раз-, без-?',
  'Обясни ми какво е теза в съчинение',
  'Какви теми излизат на НВО по БЕЛ?',
]

const fallbackRecentQuestions = [
  'Кога се поставя запетая пред "и"?',
  'Каква е разликата между пряка и косвена реч?',
  'Какво е метафора и как я разпознавам?',
  'Какви теми излизат на ДЗИ по литература?',
]

const initialMessages: Message[] = [
  {
    id: '0',
    role: 'assistant',
    text: 'Здравей! Аз съм твоят AI помощник по подготовката за НВО и ДЗИ. Мога да обяснявам теми, да анализирам грешките ти, да задавам упражнения и да ти помагам да разбереш по-дълбоко всяка тема. Какво те интересува днес?',
    time: 'сега',
  },
]

type UsageInfo = {
  plan: 'free' | 'premium'
  remaining: number | null
  recentQuestions: string[]
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [authRequired, setAuthRequired] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/usage', { cache: 'no-store' })
      if (res.status === 401) {
        setAuthRequired(true)
        return
      }
      if (!res.ok) return
      const data = (await res.json()) as UsageInfo
      setUsage(data)
    } catch {
      // network — игнорираме, банерът просто остава празен
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    const userMsgId = Date.now().toString()
    const assistantMsgId = (Date.now() + 1).toString()

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: trimmed, time: 'сега' },
      { id: assistantMsgId, role: 'assistant', text: '', time: 'сега' },
    ])
    setInput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversationIdRef.current ?? undefined,
        }),
      })

      if (res.status === 401) {
        setAuthRequired(true)
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsgId && m.id !== userMsgId)
        )
        return
      }

      if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null
        setError(
          data?.message ??
            'Достигна седмичния лимит. Надгради за неограничен достъп.'
        )
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsgId && m.id !== userMsgId)
        )
        return
      }

      if (!res.ok || !res.body) {
        setError('Възникна грешка. Моля, опитай отново.')
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsgId && m.id !== userMsgId)
        )
        return
      }

      const conversationId = res.headers.get('x-conversation-id')
      if (conversationId) conversationIdRef.current = conversationId

      const remainingHeader = res.headers.get('x-quota-remaining')
      const planHeader = res.headers.get('x-plan') as 'free' | 'premium' | null
      if (planHeader) {
        const remaining =
          remainingHeader === 'unlimited' || remainingHeader === null
            ? null
            : Number.parseInt(remainingHeader, 10)
        setUsage((prev) => ({
          plan: planHeader,
          remaining: Number.isFinite(remaining) ? (remaining as number) : null,
          recentQuestions: prev?.recentQuestions ?? [],
        }))
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, text: assistantText } : m))
        )
      }

      if (assistantText.trim().length === 0) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: 'Извинявай, нещо се обърка с отговора. Опитай пак след малко.',
                }
              : m
          )
        )
      }

      // Refresh quota + recent questions in background.
      fetchUsage()
    } catch (err) {
      console.error('[ai] chat error', err)
      setError('Възникна грешка. Моля, опитай отново.')
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMsgId && m.id !== userMsgId)
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const recentQuestions =
    usage?.recentQuestions && usage.recentQuestions.length > 0
      ? usage.recentQuestions
      : fallbackRecentQuestions

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col relative">
      <TopBar title="AI помощник" />
      <div className="flex-1 flex overflow-hidden">

        {/* Chat area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">

            {/* Intro header */}
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light mx-auto mb-3 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <h2 className="font-serif font-bold text-text">AI помощник</h2>
              <p className="text-sm text-text-muted mt-1">Специализиран за НВО и ДЗИ</p>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white border border-border text-text rounded-tl-sm shadow-card'
                }`}>
                  {msg.text || (msg.role === 'assistant' && isStreaming ? '…' : '')}
                </div>
              </div>
            ))}

            {error && (
              <div className="max-w-md mx-auto rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs px-3 py-2 text-center">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && (
            <div className="px-4 md:px-6 pb-3">
              <p className="text-xs text-text-muted mb-2 font-medium">Предложения:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isStreaming || authRequired}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-white text-text hover:bg-gray-50 hover:border-primary/30 transition-colors disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 md:p-6 bg-white border-t border-border">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Задай въпрос по темата..."
                disabled={isStreaming || authRequired}
                className="input-field flex-1 disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming || authRequired}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors disabled:opacity-40 flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-2 text-center">
              AI помощникът е специализиран за НВО и ДЗИ материал. Отговорите са ориентировъчни.
            </p>
          </div>
        </div>

        {/* Side panel (desktop) */}
        <div className="hidden xl:flex flex-col w-64 border-l border-border bg-white p-4 gap-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Последни въпроси
            </h3>
            <div className="space-y-2">
              {recentQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isStreaming || authRequired}
                  className="w-full text-left text-xs text-text hover:text-primary transition-colors py-1.5 border-b border-border last:border-0 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Предложения
            </h3>
            <div className="space-y-1.5">
              {suggestedPrompts.slice(4).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={isStreaming || authRequired}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-primary-light text-text hover:text-primary px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="card p-3 bg-primary-light border-primary/20">
              {usage?.plan === 'premium' ? (
                <>
                  <p className="text-xs font-semibold text-primary mb-1">Премиум план</p>
                  <p className="text-[11px] text-primary/70">Неограничени въпроси.</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-primary mb-1">Безплатен план</p>
                  <p className="text-[11px] text-primary/70 mb-2">
                    {usage
                      ? `Остават ${usage.remaining ?? 0} въпроса тази седмица`
                      : '5 въпроса на седмица'}
                  </p>
                  <a
                    href="/dashboard/subscription"
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    Надгради за неограничено
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {authRequired && (
        <div className="absolute inset-0 top-[56px] md:top-[64px] z-30 flex items-center justify-center bg-white/55 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border border-border bg-white shadow-2xl p-6 md:p-8 text-center">
            <h2 className="font-serif font-bold text-text text-xl md:text-2xl mb-2">
              Необходимо е влизане
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              Влез в профила си, за да разговаряш с AI помощника.
            </p>
            <a
              href="/login?redirectTo=/dashboard/ai"
              className="btn-primary inline-block"
            >
              Влез
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
