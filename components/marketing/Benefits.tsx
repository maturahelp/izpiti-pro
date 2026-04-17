const pills = [
  { label: 'Онлайн обучение', src: '/landing-icons/Gemini_Generated_Image_2pslzb2pslzb2psl.png', size: 'w-9 h-9' },
  { label: 'Напредък',        src: '/landing-icons/Gemini_Generated_Image_j83hboj83hboj83h.png', size: 'w-8 h-8' },
  { label: 'Учи от всяко място', src: '/landing-icons/Gemini_Generated_Image_ssz323ssz323ssz3.png', size: 'w-7 h-7' },
]

const featureCards = [
  { label: 'Видео обучение', sub: 'Гледай уроци по всяко време',         src: '/landing-icons/Gemini_Generated_Image_ouuhspouuhspouuh.png' },
  { label: 'Теория',         sub: 'Учебни материали',                     src: '/landing-icons/Gemini_Generated_Image_y540e6y540e6y540.png' },
  { label: 'AI помощник',   sub: 'Следи своя прогрес',                   src: '/landing-icons/Gemini_Generated_Image_3g0oe33g0oe33g0o.png' },
  { label: 'Тестов режим',  sub: 'Практикувай под реални условия',       src: '/landing-icons/Gemini_Generated_Image_50frum50frum50fr.png' },
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
              <div className={`${pill.size} flex-shrink-0 overflow-hidden rounded-md`}>
                <img src={pill.src} alt={pill.label} className="w-full h-full object-cover" />
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
                className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white overflow-hidden group-hover:scale-110 transition"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                <img src={card.src} alt={card.label} className="w-full h-full object-cover" />
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
