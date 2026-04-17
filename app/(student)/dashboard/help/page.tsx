'use client'

import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'

const faqs = [
  {
    q: 'Как да започна с подготовката за матура?',
    a: 'Отвори раздел "Материали" и избери предмет — там ще намериш обобщения, видео уроци и упражнения, подредени по теми. Ако искаш да провериш знанията си веднага, отвори "Тестове" и избери примерен изпит.',
  },
  {
    q: 'Каква е разликата между примерните и миналогодишните изпити?',
    a: 'Примерните изпити са съставени по модела на НВО/ДЗИ, но с нови въпроси. Миналогодишните са реалните изпити от предишни сесии — можеш да ги използваш, за да се запознаеш с типа задачи и формата.',
  },
  {
    q: 'Запазват ли се отговорите ми ако затворя страницата?',
    a: 'Да — прогресът ти по всеки тест се пази локално, така че можеш да продължиш от там, където си спрял, дори след рестарт на браузъра.',
  },
  {
    q: 'Какво прави AI помощникът?',
    a: 'Можеш да му зададеш въпрос по конкретна тема или задача и той ще ти обясни стъпка по стъпка. Използвай го когато заседнеш и искаш обяснение с по-прости думи.',
  },
  {
    q: 'Как да сменя паролата си?',
    a: 'От "Настройки" можеш да заявиш смяна на паролата. Или ако си излязъл от акаунта, използвай "Забравена парола" на страницата за вход.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Помощ" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        <div className="card p-6">
          <h1 className="text-xl font-serif font-bold text-text mb-1">Имаш въпрос?</h1>
          <p className="text-sm text-text-muted">
            Виж често задаваните въпроси отдолу или се свържи с нас директно.
          </p>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {faqs.map((item, idx) => (
              <details key={idx} className="group">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-text">{item.q}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-muted flex-shrink-0 transition-transform group-open:rotate-180"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-serif font-bold text-text mb-2">Свържи се с нас</h2>
          <p className="text-sm text-text-muted mb-4">
            Ако не откри отговора на въпроса си, пиши ни и ще се свържем с теб.
          </p>
          <a
            href="mailto:support@maturahelp.bg"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            support@maturahelp.bg
          </a>
        </div>

        <div className="text-center">
          <Link href="/dashboard/materials" className="text-sm text-primary font-semibold hover:underline">
            Обратно към материалите
          </Link>
        </div>
      </div>
    </div>
  )
}
