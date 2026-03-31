'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { currentUser } from '@/data/users'

export default function ProfilePage() {
  const [notifications, setNotifications] = useState({
    newTests: true,
    weeklyReport: true,
    aiAnswers: false,
    promotions: false,
  })

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Профил" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        {/* Profile header */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary font-serif">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-text">{currentUser.name}</h1>
            <p className="text-sm text-text-muted">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`badge text-xs ${currentUser.plan === 'premium' ? 'bg-amber-light text-amber' : 'bg-gray-100 text-text-muted'}`}>
                {currentUser.plan === 'premium' ? 'Премиум' : 'Безплатен план'}
              </span>
              <span className="badge bg-gray-100 text-text-muted text-xs">
                {currentUser.class === '7' ? '7. клас' : '12. клас'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text text-sm">Лична информация</h2>
            <button className="text-xs text-primary hover:underline font-medium">Редактирай</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Пълно име</label>
              <input type="text" defaultValue={currentUser.name} className="input-field" readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Имейл адрес</label>
              <input type="email" defaultValue={currentUser.email} className="input-field" readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Клас</label>
              <select defaultValue={currentUser.class} className="input-field">
                <option value="7">7. клас</option>
                <option value="12">12. клас</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Изпитен път</label>
              <select defaultValue={currentUser.examPath} className="input-field">
                <option>НВО — Български език</option>
                <option>НВО — Математика</option>
                <option>ДЗИ — Български език и литература</option>
                <option>ДЗИ — Математика</option>
                <option>ДЗИ — История и цивилизации</option>
              </select>
            </div>
          </div>
          <button className="btn-primary mt-4 text-sm">Запази промените</button>
        </div>

        {/* Password */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Смяна на парола</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Текуща парола</label>
              <input type="password" placeholder="Въведи текущата парола" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Нова парола</label>
              <input type="password" placeholder="Минимум 8 знака" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Потвърди нова парола</label>
              <input type="password" placeholder="Повтори новата парола" className="input-field" />
            </div>
          </div>
          <button className="btn-secondary mt-4 text-sm">Смени паролата</button>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Настройки за известия</h2>
          <div className="space-y-3">
            {[
              { key: 'newTests', label: 'Нови тестове и уроци', desc: 'Когато добавим ново съдържание' },
              { key: 'weeklyReport', label: 'Седмичен отчет за напредъка', desc: 'Всеки понеделник' },
              { key: 'aiAnswers', label: 'Имейл при AI отговор', desc: 'Ако не ти отговорим веднага' },
              { key: 'promotions', label: 'Промоции и оферти', desc: 'Специални ценови предложения' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-5 border-danger/20">
          <h2 className="font-semibold text-text mb-3 text-sm">Изход и изтриване</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn-secondary text-sm justify-center">
              Изход от профила
            </button>
            <button className="text-sm font-medium text-danger hover:bg-danger-light px-4 py-2.5 rounded-lg transition-colors">
              Изтрий профила
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
