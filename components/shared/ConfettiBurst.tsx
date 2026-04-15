'use client'

const COLORS = ['#2F6FED', '#16A34A', '#F59E0B', '#EF4444', '#14B8A6', '#E11D48']

const SIZE_CONFIG = {
  small: { count: 18, base: 5, distance: 58 },
  medium: { count: 26, base: 6, distance: 78 },
  large: { count: 38, base: 7, distance: 96 },
}

export function ConfettiBurst({
  burstKey,
  origin,
  size = 'medium',
}: {
  burstKey: number
  origin?: { x: number; y: number } | null
  size?: keyof typeof SIZE_CONFIG
}) {
  if (!burstKey) return null

  const config = SIZE_CONFIG[size]
  const left = origin ? `${origin.x}px` : '50vw'
  const top = origin ? `${origin.y}px` : '50vh'

  return (
    <div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none fixed z-[80] h-0 w-0 overflow-visible"
      style={{ left, top }}
    >
      {Array.from({ length: config.count }).map((_, index) => {
        const delay = (index % 9) * 42
        const duration = 760 + (index % 5) * 90
        const particleSize = config.base + (index % 4) * 2
        const angle = -150 + ((index * 300) / Math.max(config.count - 1, 1))
        const distance = config.distance * (0.65 + (index % 4) * 0.14)
        const x = Math.cos((angle * Math.PI) / 180) * distance
        const y = Math.sin((angle * Math.PI) / 180) * distance - 18

        return (
          <span
            key={index}
            className="absolute left-0 top-0 rounded-[2px]"
            style={{
              width: particleSize,
              height: particleSize * 1.45,
              backgroundColor: COLORS[index % COLORS.length],
              animation: `confetti-burst ${duration}ms cubic-bezier(0.13, 0.88, 0.28, 1.02) ${delay}ms forwards`,
              ['--confetti-x' as string]: `${x}px`,
              ['--confetti-y' as string]: `${y}px`,
              ['--confetti-rotate' as string]: `${index * 37 + 180}deg`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes confetti-burst {
          0% {
            opacity: 0;
            translate: -50% -50%;
            scale: 0.35;
            rotate: 0deg;
          }
          12%,
          72% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            translate: calc(-50% + var(--confetti-x)) calc(-50% + var(--confetti-y));
            scale: 1;
            rotate: var(--confetti-rotate);
          }
        }
      `}</style>
    </div>
  )
}
