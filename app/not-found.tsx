import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { NavDrawerProvider, NavDrawerPanel, LoginGateModal } from '@/components/marketing/NavDrawer'

export default function NotFound() {
  return (
    <NavDrawerProvider>
      <Header />

      <main className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFF] px-6 py-24">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#5899E2] mb-4">Грешка 404</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2845] mb-4">
            Тази страница не съществува
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            Възможно е адресът да е сгрешен или страницата да е преместена.
            Провери отново линка или се върни към началото.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#5899E2] hover:bg-[#335C81] text-white font-semibold px-8 py-3.5 rounded-full text-base transition-all"
          >
            Обратно към началото
          </Link>
        </div>
      </main>

      <Footer />
      <NavDrawerPanel />
      <LoginGateModal />
    </NavDrawerProvider>
  )
}
