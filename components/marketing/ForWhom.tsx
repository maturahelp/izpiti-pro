import Image from 'next/image'

const valueBullets = [
  {
    title: 'Всичко на едно място',
    sub: 'Без лутане между сайтове, файлове и клипове',
  },
  {
    title: 'Реален напредък',
    sub: 'Виждаш какво си минал и какво ти остава',
  },
]

const bookCovers = [
  { label: 'Под игото', offset: '' },
  { label: 'Ветрената мелница', offset: 'mt-8' },
  { label: 'Балкански синдром', offset: '-mt-4' },
  { label: 'Литература', offset: 'mt-4' },
]

export function ForWhom() {
  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Book cover grid */}
          <div className="grid grid-cols-2 gap-4">
            {bookCovers.map((book) => (
              <Image
                key={book.label}
                src={`https://placehold.co/400x224/1e2a4a/ffffff?text=${encodeURIComponent(book.label)}`}
                alt={book.label}
                width={400}
                height={224}
                className={`w-full h-48 md:h-56 object-cover rounded-2xl ${book.offset}`}
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              />
            ))}
          </div>

          {/* Value prop */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>
              От първия ден учиш по-спокойно
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Когато всичко е на едно място, подготовката става по-лесна. Получаваш теория, видео уроци, практика и проследяване на напредъка в една ясна система.
            </p>
            <div className="space-y-4 mb-8">
              {valueBullets.map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: '#1e2a4a' }}>{b.title}</h4>
                    <p className="text-xs text-gray-400">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="#how-it-works"
              className="inline-block text-white font-semibold px-8 py-3 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
              style={{ background: '#3b82f6' }}
            >
              Виж как работи
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
