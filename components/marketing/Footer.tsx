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
    <footer className="bg-sidebar text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm font-serif">И</span>
              </span>
              <span className="font-bold text-white text-lg font-serif">ИзпитиПро</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци и AI помощник.
            </p>
            <a
              href="mailto:support@izpitipro.bg"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              support@izpitipro.bg
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            2024 ИзпитиПро. Всички права запазени.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">
              Общи условия
            </Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">
              Политика за поверителност
            </Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">
              Контакти
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
