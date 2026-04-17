const pills = [
  {
    label: 'Онлайн обучение',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    label: 'Напредък',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Учи от всяко място',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
]

const featureCards = [
  {
    label: 'Видео обучение',
    sub: 'Гледай уроци по всяко време',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: 'Теория',
    sub: 'Учебни материали',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: 'AI помощник',
    sub: 'Следи своя прогрес',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    label: 'Тестов режим',
    sub: 'Практикувай под реални условия',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

export function Benefits() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {pills.map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-2.5 bg-white rounded-full px-5 py-2.5"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-md bg-blue-50">
                {pill.icon}
              </div>
              <span className="text-xs font-semibold" style={{ color: '#1e2a4a' }}>{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featureCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-6 text-center hover:shadow-md transition group"
              style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                {card.icon}
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color: '#1e2a4a' }}>{card.label}</h3>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
