import { TopBar } from '@/components/dashboard/TopBar'
import { PriemBalCalculator } from '@/components/marketing/PriemBalCalculator'

export default function KalkulatorBalPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-bg">
      <TopBar title="Калкулатор за бал" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="section-label text-primary mb-2">Прием след 7. клас</p>
          <h1 className="page-title text-2xl sm:text-3xl mb-2">
            Изчисли минималния си бал
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            Въведи резултатите от НВО и две оценки от свидетелството, за да
            видиш в коя паралелка в София-град можеш да влезеш според приема за
            2025 г.
          </p>
        </div>
        <PriemBalCalculator />
      </div>
    </div>
  )
}
