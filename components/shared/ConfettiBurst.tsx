'use client'

const COLORS = ['#2F6FED', '#16A34A', '#F59E0B', '#EF4444', '#14B8A6', '#E11D48']

export function ConfettiBurst({ burstKey }: { burstKey: number }) {
  if (!burstKey) return null

  return (
    <div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
    >
      {Array.from({ length: 42 }).map((_, index) => {
        const left = 16 + ((index * 17) % 68)
        const delay = (index % 9) * 42
        const duration = 900 + (index % 5) * 120
        const size = 7 + (index % 4) * 2

        return (
          <span
            key={index}
            className="absolute top-[18%] rounded-[2px]"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.45,
              backgroundColor: COLORS[index % COLORS.length],
              transform: `rotate(${index * 29}deg)`,
              animation: `confetti-fall ${duration}ms ease-out ${delay}ms forwards`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            translate: 0 0;
            rotate: 0deg;
          }
          100% {
            opacity: 0;
            translate: var(--confetti-x, 0) 72vh;
            rotate: 540deg;
          }
        }
        span:nth-child(3n) {
          --confetti-x: -84px;
        }
        span:nth-child(3n + 1) {
          --confetti-x: 64px;
        }
        span:nth-child(3n + 2) {
          --confetti-x: 18px;
        }
      `}</style>
    </div>
  )
}
