import Link from 'next/link'

const footerLinks = {
  Платформа: [
    { label: 'Как работи', href: '#kak-raboti' },
    { label: 'Изпити', href: '#izpiti' },
    { label: 'Цени', href: '#ceni' },
    { label: 'Честа задавани въпроси', href: '#chesto-zadavani-vaprosi' },
  ],
  Предмети: [
    { label: 'НВО Български език', href: '/dashboard/tests' },
    { label: 'НВО Математика', href: '/dashboard/tests' },
    { label: 'ДЗИ БЕЛ', href: '/dashboard/tests' },
    { label: 'ДЗИ Математика', href: '/dashboard/tests' },
  ],
  Компания: [
    { label: 'За нас', href: '#' },
    { label: 'Контакти', href: '#' },
    { label: 'Блог', href: '#' },
    { label: 'Новини', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0B1120] text-slate-400">
      <div className="max-w-6xl mx-auto px-5 sm:px-7 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M14 8C14 8 10.5 6 5 6.5V21.5C10.5 21 14 23 14 23C14 23 17.5 21 23 21.5V6.5C17.5 6 14 8 14 8Z" stroke="#93c5fd" strokeWidth="1.6" strokeLinejoin="round" fill="white/5"/>
                <path d="M14 8V23" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M8 10.5C9.5 10.2 11 10.1 12.5 10.3" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M8 13C9.5 12.7 11 12.6 12.5 12.8" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 10.3C17 10.1 18.5 10.2 20 10.5" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M15.5 12.8C17 12.6 18.5 12.7 20 13" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="font-serif font-bold text-white text-[17px] tracking-[-0.02em]">MaturaHelp</span>
            </Link>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
              Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци и AI помощник.
            </p>
            <a
              href="mailto:support@izpitipro.bg"
              className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors duration-150"
            >
              support@izpitipro.bg
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11.5px] font-semibold text-white/70 uppercase tracking-[0.08em] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.07] pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-slate-600">
            © 2024 MaturaHelp. Всички права запазени.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors duration-150">
              Общи условия
            </Link>
            <Link href="#" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors duration-150">
              Поверителност
            </Link>
            <Link href="#" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors duration-150">
              Контакти
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
