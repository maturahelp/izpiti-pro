import Link from 'next/link'
import { LEGAL_SUPPORT_EMAIL } from '@/lib/legal-consent'
import { BrandLogo } from '@/components/shared/BrandLogo'

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
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#060D1F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(27,79,216,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-7 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <BrandLogo className="h-7 w-7 shrink-0" />
              <span className="font-black text-white text-[17px] tracking-[-0.03em] group-hover:text-blue-200 transition-colors duration-200">MaturaHelp</span>
            </Link>
            <p className="text-[13px] text-white/30 leading-relaxed mb-5">
              Интерактивна платформа за подготовка за НВО и ДЗИ с тестове, аудио уроци и AI помощник.
            </p>
            <a
              href={`mailto:${LEGAL_SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-[13px] text-white/30 hover:text-blue-300 transition-colors duration-200"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {LEGAL_SUPPORT_EMAIL}
            </a>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.instagram.com/maturahelp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@maturahelpbg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.65a8.16 8.16 0 0 0 4.77 1.52V7.72a4.85 4.85 0 0 1-1.01-.03z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-black text-white/50 uppercase tracking-[0.1em] mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/30 hover:text-white/70 transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <svg width="10" height="10" viewBox="0 0 28 28" fill="none"><path d="M14 8V23" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[12px] text-white/20 font-medium">
              © 2024 MaturaHelp. Всички права запазени.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-200 font-medium">
              Общи условия
            </Link>
            <Link href="/privacy" className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-200 font-medium">
              Поверителност
            </Link>
            <Link href="/cookies" className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-200 font-medium">
              Бисквитки
            </Link>
            <button
              type="button"
              data-cookie-settings-trigger
              className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-200 font-medium"
            >
              Настройки за бисквитки
            </button>
            <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-200 font-medium">
              Контакти
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
