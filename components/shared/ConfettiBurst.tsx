'use client'

const COLORS = ['#2F6FED', '#16A34A', '#F59E0B', '#EF4444', '#14B8A6', '#E11D48']

const SIZE_CONFIG = {
  small: { count: 28, base: 5, spread: 54, fall: 58 },
  medium: { count: 42, base: 7, spread: 68, fall: 72 },
  large: { count: 72, base: 11, spread: 84, fall: 82 },
}

export function ConfettiBurst({
  burstKey,
  size = 'medium',
}: {
  burstKey: number
  size?: keyof typeof SIZE_CONFIG
}) {
  if (!burstKey) return null

  const config = SIZE_CONFIG[size]

  return (
    <div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
    >
      {Array.from({ length: config.count }).map((_, index) => {
        const left = 8 + ((index * 17) % config.spread)
        const delay = (index % 9) * 42
        const duration = 900 + (index % 5) * 120
        const particleSize = config.base + (index % 4) * 2

        return (
          <span
            key={index}
            className="absolute top-[18%] rounded-[2px]"
            style={{
              left: `${left}%`,
              width: particleSize,
              height: particleSize * 1.45,
              backgroundColor: COLORS[index % COLORS.length],
              transform: `rotate(${index * 29}deg)`,
              animation: `confetti-fall ${duration}ms ease-out ${delay}ms forwards`,
              ['--confetti-fall' as string]: `${config.fall}vh`,
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
            translate: var(--confetti-x, 0) var(--confetti-fall, 72vh);
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
