'use client'

import { useState } from 'react'
import { sampleQuestions } from '@/data/tests'
import { Badge } from '@/components/shared/Badge'

function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text text-base">{title}</h1>
      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
        <span className="text-xs font-bold text-primary">АД</span>
      </div>
    </header>
  )
}

export default function AdminQuestionsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState(0)

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Управление на въпроси" />
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">{sampleQuestions.length} въпроса (примерни)</p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary text-sm"
          >
            Добави въпрос
          </button>
        </div>

        {/* Add question form */}
        {showAddForm && (
          <div className="card p-6">
            <h2 className="font-semibold text-text mb-4">Нов въпрос</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Тест</label>
                <select className="input-field">
                  <option>Правопис и пунктуация — основни правила</option>
                  <option>Числа и изрази — пробен тест 1</option>
                  <option>Стилистика — изразни средства</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Текст на въпроса</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Въведи текста на въпроса..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Отговори</label>
                <div className="space-y-2">
                  {['А', 'Б', 'В', 'Г'].map((letter, i) => (
                    <div key={letter} className="flex items-center gap-3">
                      <button
                        onClick={() => setCorrectAnswer(i)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          correctAnswer === i ? 'border-success bg-success' : 'border-border'
                        }`}
                      >
                        {correctAnswer === i && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" fill="none"/>
                          </svg>
                        )}
                      </button>
                      <input
                        type="text"
                        placeholder={`Отговор ${letter}`}
                        className="input-field flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-text-muted">Кликни на кръгчето, за да маркираш верния отговор</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Обяснение</label>
                <textarea
                  className="input-field min-h-[60px] resize-none"
                  placeholder="Обяснение защо отговорът е верен..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Точки</label>
                <input type="number" defaultValue={2} className="input-field w-24" />
              </div>
              <div className="flex gap-3">
                <button className="btn-primary text-sm">Запази въпроса</button>
                <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">Отказ</button>
              </div>
            </div>
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-3">
          {sampleQuestions.map((q) => (
            <div key={q.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm font-medium text-text flex-1">{q.text}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="neutral">{q.points} т.</Badge>
                  <button className="text-xs text-primary hover:underline">Редактирай</button>
                  <button className="text-xs text-danger hover:underline">Изтрий</button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                {q.options.map((opt, i) => (
                  <div
                    key={opt}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      i === q.correctIndex
                        ? 'bg-success-light text-success border border-success/20'
                        : 'bg-gray-50 text-text border border-border'
                    }`}
                  >
                    <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {i === q.correctIndex && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="ml-auto">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-text-muted"><strong className="text-text">Обяснение:</strong> {q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
