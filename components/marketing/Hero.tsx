import Link from 'next/link'

const bookCovers = [
  { src: '/book-covers/pod-igoto.jpg',         alt: 'Под игото' },
  { src: '/book-covers/vetrena-melnitsa.jpg',  alt: 'Ветрената мелница' },
  { src: '/book-covers/balkanski-sindrom.jpg', alt: 'Балкански синдром' },
  { src: '/book-covers/kniga.jpg',             alt: 'Неразделни' },
]

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #f0efff 0%, #d9f0ff 55%, #edf9f3 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="max-w-lg md:max-w-xl md:ml-auto md:pr-4 lg:pr-8">
            <h1 className="text-4xl md:text-[2.85rem] lg:text-[3.1rem] font-extrabold leading-tight mb-6" style={{ color: '#1e2a4a' }}>
              Всичко за{' '}
              <span style={{ color: '#3b82f6' }}>НВО</span> и{' '}
              <span style={{ color: '#3b82f6' }}>ДЗИ</span> на едно място
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              MaturaHelp ти дава подредена подготовка за 7 и 12 клас с уроци, видеа, тестове и практика по всички теми.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="text-white font-semibold px-12 py-3.5 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
                style={{ background: '#3b82f6' }}
              >
                Започни
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
              >
                <span
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                >
                  <svg className="w-4 h-4 ml-0.5" fill="#3b82f6" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </span>
                Виж как работи
              </a>
            </div>
          </div>

          {/* Right: book covers grid + floating stat */}
          <div className="relative flex justify-center">
            <div className="relative z-10 w-full max-w-md">
              {/* 2×2 book cover grid */}
              <div className="grid grid-cols-2 gap-3">
                {bookCovers.map((book, i) => (
                  <img
                    key={book.alt}
                    src={book.src}
                    alt={book.alt}
                    className={`w-full h-44 md:h-52 object-cover rounded-2xl ${i === 1 || i === 3 ? 'mt-6' : ''}`}
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                ))}
              </div>
              {/* Floating stat card */}
              <div
                className="absolute -left-4 -bottom-4 bg-white rounded-2xl px-5 py-4 flex items-center gap-3"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: '#1e2a4a' }}>4 800+</p>
                  <p className="text-xs text-gray-400 mt-0.5">Активни ученици</p>
                </div>
              </div>
              {/* Floating badge */}
              <div
                className="absolute -right-2 top-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold leading-none" style={{ color: '#1e2a4a' }}>500+</p>
                  <p className="text-[11px] text-gray-400">Теста</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
