const footerLinks = {
  Платформата: [
    { label: 'НВО подготовка', href: '#' },
    { label: 'ДЗИ подготовка', href: '#' },
    { label: 'Видео уроци', href: '#' },
    { label: 'Тестове', href: '#' },
  ],
  Поддръжка: [
    { label: 'Помощен център', href: '#' },
    { label: 'ЧЗВ', href: '#faq' },
    { label: 'Свържи се с нас', href: '#' },
    { label: 'Поверителност', href: '#' },
    { label: 'Условия за ползване', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="pt-16 pb-8 text-white" style={{ background: '#1e2a4a' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-3.14 1.346 2.14.916a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.04em', fontSize: '1.1rem' }}>
                <span style={{ color: '#fff' }}>Matura</span>
                <span style={{ color: '#60a5fa' }}>Help</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Платформата за подготовка за НВО и ДЗИ с видео уроци, тестове и AI помощник.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-bold text-white mb-4">{group}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Контакт</h4>
            <p className="text-sm text-gray-400 mb-2">MaturaHelp.com</p>
            <p className="text-sm text-gray-400">България</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 MaturaHelp. Всички права запазени.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-white transition">Поверителност</a>
            <a href="#" className="text-xs text-gray-500 hover:text-white transition">Условия</a>
            <a href="#" className="text-xs text-gray-500 hover:text-white transition">Бисквитки</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
