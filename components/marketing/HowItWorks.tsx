const bullets = [
  {
    src: '/landing-page3-icons/Gemini_Generated_Image_53y53k53y53k53y5.png',
    title: 'Най-важните теми в едно видео',
    desc: 'Получаваш най-същественото от произведението, обяснено ясно и подредено.',
  },
  {
    src: '/landing-page3-icons/Gemini_Generated_Image_1zqjw41zqjw41zqj.png',
    title: 'Активира визуалната памет',
    desc: 'Когато гледаш и слушаш едновременно, запомняш по-лесно образи, герои и идеи.',
  },
  {
    src: '/landing-page3-icons/Gemini_Generated_Image_q54f0wq54f0wq54f.png',
    title: 'Тест след видео урока',
    desc: 'След всеки урок можеш да провериш какво си разбрал и какво още трябва да преговориш.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>
            Видео уроци, които ти показват най-важното
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Разбери произведението по-лесно, запомни ключовите моменти и провери какво си научил веднага след урока.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Video placeholder */}
          <div className="relative flex justify-center">
            <div className="w-72 h-72 md:w-[400px] md:h-[400px] rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 w-full max-w-lg">
              <div
                className="w-full rounded-2xl bg-[#1e2a4a] flex items-center justify-center"
                style={{ height: '280px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-white/70 text-sm">Видео урок</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-bold" style={{ color: '#1e2a4a' }}>Под игото - Радини вълнения</p>
                <p className="text-xs text-gray-400">Видео урок</p>
              </div>
            </div>
          </div>

          {/* Bullets */}
          <div className="space-y-5 md:pt-8">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={b.src} alt="" className="w-20 h-20 flex-shrink-0 object-contain" />
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: '#1e2a4a' }}>{b.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
