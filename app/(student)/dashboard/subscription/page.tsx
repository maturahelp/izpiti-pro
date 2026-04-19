'use client'

import { TopBar } from '@/components/dashboard/TopBar'

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Абонамент" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {/* Premium plan status */}
        <div className="card p-5 border-success/30 bg-success-light/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-bold text-amber uppercase tracking-wider">Премиум</span>
              </div>
              <p className="font-bold text-text text-lg font-serif">Активен абонамент</p>
              <p className="text-sm text-text-muted mt-0.5">Месечен план · 15.99 лв./месец</p>
            </div>
            <span className="badge badge-success px-3 py-1">Активен</span>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-text mb-4 text-sm">Информация за абонамента</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Следващо плащане</span>
              <span className="font-medium text-text">15.04.2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Сума</span>
              <span className="font-medium text-text">15.99 лв.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Метод на плащане</span>
              <span className="font-medium text-text">Visa ···· 4242</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Активен от</span>
              <span className="font-medium text-text">15.01.2024</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-secondary flex-1 justify-center">
            Промени план
          </button>
          <button className="btn-ghost flex-1 justify-center text-danger hover:bg-danger-light">
            Отказ от абонамент
          </button>
        </div>
      </div>
    </div>
  )
}
