'use client'

import { useEffect, useState } from 'react'

interface ConfettiBurstProps {
  trigger: number
  message?: string
}

const pieces = Array.from({ length: 18 }, (_, index) => index)

export function ConfettiBurst({ trigger, message = 'Готово!' }: ConfettiBurstProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!trigger) return
    setVisible(true)
    const timeout = window.setTimeout(() => setVisible(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [trigger])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[70] flex justify-center px-4">
      <div className="relative rounded-lg border border-success/30 bg-white px-4 py-3 text-sm font-semibold text-success shadow-lg">
        {message}
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          {pieces.map((piece) => (
            <span
              key={piece}
              className="absolute h-2 w-2 rounded-[2px] animate-[confetti-pop_900ms_ease-out_forwards]"
              style={{
                backgroundColor: ['#2F80ED', '#10B981', '#F59E0B', '#EF4444'][piece % 4],
                transform: `rotate(${piece * 21}deg)`,
                ['--tx' as string]: `${Math.cos((piece / pieces.length) * Math.PI * 2) * (54 + (piece % 3) * 16)}px`,
                ['--ty' as string]: `${Math.sin((piece / pieces.length) * Math.PI * 2) * (38 + (piece % 4) * 12)}px`,
              }}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes confetti-pop {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0.4) rotate(160deg);
          }
        }
      `}</style>
    </div>
  )
}
