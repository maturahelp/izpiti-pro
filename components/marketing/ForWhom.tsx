const valueBullets = [
  {
    src: '/landing-4th-icons/Gemini_Generated_Image_f3p7pbf3p7pbf3p7.png',
    title: 'Всичко на едно място',
    sub: 'Без лутане между сайтове, файлове и клипове',
  },
  {
    src: '/landing-4th-icons/Gemini_Generated_Image_go9fm2go9fm2go9f.png',
    title: 'Реален напредък',
    sub: 'Виждаш какво си минал и какво ти остава',
  },
]

const bookCovers = [
  { src: '/book-covers/pod-igoto.jpg',         alt: 'Под игото представлението', offset: '' },
  { src: '/book-covers/vetrena-melnitsa.jpg',  alt: 'Ветрената мелница',         offset: 'mt-8' },
  { src: '/book-covers/balkanski-sindrom.jpg', alt: 'Балкански синдром',          offset: '-mt-4' },
  { src: '/book-covers/kniga.jpg',             alt: 'Книга',                      offset: 'mt-4' },
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
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>
              От първия ден учиш по-спокойно
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Когато всичко е на едно място, подготовката става по-лесна. Получаваш теория, видео уроци, практика и проследяване на напредъка в една ясна система.
            </p>
            <div className="space-y-4 mb-8">
              {valueBullets.map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <img src={b.src} alt="" className="w-20 h-20 flex-shrink-0 object-contain" />
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
