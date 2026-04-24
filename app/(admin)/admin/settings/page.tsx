'use client'

import { useState } from 'react'

function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text text-base">{title}</h1>
      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
        <span className="text-xs font-bold text-primary">АД</span>
      </div>
    </header>
  )
}

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [newRegistrations, setNewRegistrations] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  const toggleItems = [
    { key: 'maintenance', label: 'Режим на поддръжка', desc: 'Спира достъпа на потребителите', value: maintenanceMode, set: setMaintenanceMode },
    { key: 'registrations', label: 'Нови регистрации', desc: 'Позволява регистриране на нови потребители', value: newRegistrations, set: setNewRegistrations },
    { key: 'ai', label: 'AI помощник', desc: 'Включва или изключва AI функционалността', value: aiEnabled, set: setAiEnabled },
    { key: 'emails', label: 'Имейл известия', desc: 'Изпраща системни имейл известия', value: emailNotifications, set: setEmailNotifications },
  ]

  return (
    <div className="min-h-screen">
      <AdminTopBar title="Настройки" />
      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* Platform info */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Основна информация</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Наименование на платформата</label>
              <input type="text" defaultValue="MaturaHelp" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Имейл за поддръжка</label>
              <input type="email" defaultValue="support@maturahelp.com" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">URL адрес</label>
              <input type="url" defaultValue="https://izpitipro.bg" className="input-field" />
            </div>
          </div>
          <button className="btn-primary mt-4 text-sm">Запази</button>
        </div>

        {/* Subscription settings */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Настройки на абонамента</h2>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Месечна цена (лв.)</label>
                <input type="number" defaultValue={15.99} step={0.01} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Годишна цена (лв.)</label>
                <input type="number" defaultValue={119.99} step={0.01} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Пробен период (дни)</label>
              <input type="number" defaultValue={7} className="input-field w-32" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Безплатни тестове на месец</label>
              <input type="number" defaultValue={5} className="input-field w-32" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Безплатни AI въпроси на седмица</label>
              <input type="number" defaultValue={5} className="input-field w-32" />
            </div>
          </div>
          <button className="btn-primary mt-4 text-sm">Запази</button>
        </div>

        {/* Feature toggles */}
        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Функции на платформата</h2>
          <div className="space-y-3">
            {toggleItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.value)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    item.value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      item.value ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-5 border-danger/20">
          <h2 className="font-semibold text-text mb-3 text-sm">Опасна зона</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Изчисти кеша</p>
                <p className="text-xs text-text-muted">Изчиства всички кеширани данни</p>
              </div>
              <button className="btn-secondary text-xs text-sm">Изчисти</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-danger">Изтрий всички тестови данни</p>
                <p className="text-xs text-text-muted">Необратимо изтрива демо данните</p>
              </div>
              <button className="text-xs font-medium text-danger hover:bg-danger-light px-3 py-2 rounded-lg transition-colors border border-danger/20">
                Изтрий
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
