'use client'

import { useState, useRef, useEffect } from 'react'
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

const recentQuestions = [
  'Кога се поставя запетая пред "и"?',
  'Каква е разликата между пряка и косвена реч?',
  'Как намирам корените на квадратно уравнение?',
  'Какво е метафора и как я разпознавам?',
]

const initialMessages: Message[] = [
  {
    id: '0',
    role: 'assistant',
    text: 'Здравей! Аз съм твоят AI помощник по подготовката за НВО и ДЗИ. Мога да обяснявам теми, да анализирам грешките ти, да задавам упражнения и да ти помагам да разбереш по-дълбоко всяка тема. Какво те интересува днес?',
    time: 'сега',
  },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: 'сега',
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const assistantResponses: Record<string, string> = {
        'запетая': 'Запетаята се поставя в няколко основни случая: 1) Пред подчинителни изречения (напр. "Знаех, че ще закъснееш."), 2) При вметнати изречения от двете страни, 3) При изброявания без "и". НЕ се поставя пред "и", когато то свързва два еднородни члена.',
        'тема': 'За да разберем по-добре темата, нека я разбием на части. Коя конкретна тема те интересува — правопис, пунктуация, литературен анализ или нещо друго?',
        'грешен': 'Разбирам! За да ти обясня защо отговорът е грешен, трябва да знам конкретния въпрос и отговора. Можеш ли да ми разкажеш повече за задачата?',
      }

      const lowerText = text.toLowerCase()
      let responseText = 'Много добър въпрос! Ще ти обясня тази тема стъпка по стъпка. '

      for (const [key, response] of Object.entries(assistantResponses)) {
        if (lowerText.includes(key)) {
          responseText = response
          break
        }
      }

      if (responseText.startsWith('Много добър')) {
        responseText += 'Тази тема е важна за изпита и включва няколко ключови правила. Нека започнем с основите — кое е конкретното нещо, което е неясно?'
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        time: 'сега',
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col">
      <TopBar title="AI помощник" />
      <div className="flex-1 flex overflow-hidden">

        {/* Chat area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">

            {/* Intro header */}
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light mx-auto mb-3 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2">
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white border border-border text-text rounded-tl-sm shadow-card'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
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
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-white text-text hover:bg-gray-50 hover:border-primary/30 transition-colors"
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
                className="input-field flex-1"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
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
              {recentQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-text hover:text-primary transition-colors py-1.5 border-b border-border last:border-0"
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
                  className="w-full text-left text-xs bg-gray-50 hover:bg-primary-light text-text hover:text-primary px-3 py-2 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="card p-3 bg-primary-light border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">Безплатен план</p>
              <p className="text-[11px] text-primary/70 mb-2">5 въпроса оставени тази седмица</p>
              <a href="/dashboard/subscription" className="text-[11px] text-primary font-semibold hover:underline">
                Надгради за неограничено
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
