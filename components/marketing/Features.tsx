import Link from 'next/link'
import Image from 'next/image'

const checkItems = [
  'Събирай точки за всяка завършена задача',
  'Следи прогреса си по теми и уроци',
  'Учи по-редовно с ясна мотивация',
  'Виж как малките стъпки водят до голям резултат',
]

export function Features() {
  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>
              Виж напредъка си с всяка стъпка
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Учи с видео уроци, решавай тестове и събирай точки, докато напредваш. Така винаги знаеш докъде си стигнал и какво ти остава.
            </p>
            <div className="space-y-4 mb-8">
              {checkItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            <Link
              href="/register"
              className="inline-block text-white font-semibold px-8 py-3 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
              style={{ background: '#3b82f6' }}
            >
              Започни сега
            </Link>
          </div>

          {/* Right */}
          <div className="relative flex justify-center">
            <div className="w-72 h-72 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-6" />
            <Image
              src="https://placehold.co/400x380/e0e7ff/4f46e5?text=Напредък"
              alt="Напредък"
              width={400}
              height={380}
              className="relative z-10 w-72 md:w-80 rounded-2xl object-cover"
            />
            {/* Floating rating */}
            <div
              className="absolute -bottom-4 right-4 md:right-8 bg-white rounded-2xl p-4 z-20 flex items-center gap-3"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: '#1e2a4a' }}>4.9/5</p>
                <p className="text-[10px] text-gray-400">Оценка на учениците</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
