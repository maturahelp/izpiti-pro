'use client'

import { useState } from 'react'
import Image from 'next/image'

const nvoSubjects = [
  { title: 'Български език', sub: '13 учебни теми', color: '#2d1b69' },
  { title: 'Литература', sub: '22 творби с видео уроци и упражнения за тях', color: '#1e3a5f' },
  { title: 'Математика', sub: '4 теми · 27 подтеми · 540 задачи · 108 кратки отговора', color: '#0d4a2e' },
]

const dziSubjects = [
  { title: 'Български език', sub: '43 учебни теми', color: '#2d1b69' },
  { title: 'Литература', sub: '27 творби с видео уроци и упражнения за тях', color: '#1e3a5f' },
  { title: 'Английски', sub: 'Теория', color: '#0d5a8e' },
]

export function ExamsSection() {
  const [tab, setTab] = useState<'nvo' | 'dzi'>('nvo')
  const subjects = tab === 'nvo' ? nvoSubjects : dziSubjects

  return (
    <section className="py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>НВО И ДЗИ</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Избери предмет и се подготви с видео уроци, теория и практически задачи.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setTab('nvo')}
            className="text-sm font-semibold px-8 py-2.5 rounded-full transition-all"
            style={
              tab === 'nvo'
                ? { background: '#3b82f6', color: '#fff' }
                : { background: '#fff', color: '#6b7280', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }
          >
            НВО
          </button>
          <button
            onClick={() => setTab('dzi')}
            className="text-sm font-semibold px-8 py-2.5 rounded-full transition-all"
            style={
              tab === 'dzi'
                ? { background: '#3b82f6', color: '#fff' }
                : { background: '#fff', color: '#6b7280', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }
          >
            ДЗИ
          </button>
        </div>

        {/* Subject cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {subjects.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition group"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={`https://placehold.co/400x220/${s.color.replace('#', '')}/ffffff?text=${encodeURIComponent(s.title)}`}
                  alt={s.title}
                  width={400}
                  height={220}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e2a4a' }}>{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
