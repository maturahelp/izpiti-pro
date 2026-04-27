const valueBullets = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5899E2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: 'Всичко на едно място',
    sub: 'Без лутане между сайтове, файлове и клипове',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Реален напредък',
    sub: 'Виждаш какво си минал и какво ти остава',
  },
]

const bookCovers = [
  { src: '/nvo-literature/pod-igoto-predstavlenieto.jpg', alt: 'Под игото представлението', offset: '' },
  { src: '/nvo-literature/nerazdelni.jpg',                alt: 'Неразделни',               offset: 'mt-8' },
  { src: '/nvo-literature/bai-ganio-patuva.jpg',          alt: 'Бай Ганьо пътува',         offset: '-mt-4' },
  { src: '/nvo-literature/edna-bulgarka.jpg',             alt: 'Една Българка',            offset: 'mt-4' },
]

export function ForWhom() {
  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full -translate-x-1/3 -translate-y-1/4"
        style={{ background: 'radial-gradient(circle, #eff6ff 0%, #eef2ff 100%)' }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Book cover grid */}
          <div className="grid grid-cols-2 gap-4">
            {bookCovers.map((book) => (
              <img
                key={book.alt}
                src={book.src}
                alt={book.alt}
                className={`w-full h-48 md:h-56 object-cover rounded-2xl ${book.offset}`}
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              />
            ))}
          </div>

          {/* Value prop */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1B2845' }}>
              От първия ден учиш по-спокойно
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Когато всичко е на едно място, подготовката става по-лесна. Получаваш теория, видео уроци, практика и проследяване на напредъка в една ясна система.
            </p>
            <div className="space-y-4 mb-8">
              {valueBullets.map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gray-50 flex items-center justify-center"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: '#1B2845' }}>{b.title}</h4>
                    <p className="text-xs text-gray-400">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="#kak-raboti"
              className="inline-block text-white font-semibold px-8 py-3 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
              style={{ background: '#5899E2' }}
            >
              Виж как работи
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
