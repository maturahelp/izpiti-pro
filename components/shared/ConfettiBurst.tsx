'use client'

const COLORS = ['#2F6FED', '#16A34A', '#F59E0B', '#EF4444', '#14B8A6', '#E11D48']

export function ConfettiBurst({ burstKey }: { burstKey: number }) {
  if (!burstKey) return null

  return (
    <div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 2147483647 }}
    >
      <style>{`
        @keyframes quiz-confetti-fall {
          0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
          100% { opacity: 0; transform: translate3d(var(--confetti-x, 18px), 72vh, 0) rotate(540deg); }
        }
      `}</style>
      {Array.from({ length: 54 }).map((_, index) => {
        const left = 12 + ((index * 17) % 76)
        const delay = (index % 9) * 38
        const duration = 900 + (index % 5) * 120
        const size = 7 + (index % 4) * 2
        const xOffsets = [-96, 72, 24]

        return (
          <span
            key={index}
            className="absolute top-[16%] rounded-[2px]"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.45,
              backgroundColor: COLORS[index % COLORS.length],
              animation: `quiz-confetti-fall ${duration}ms ease-out ${delay}ms forwards`,
              ['--confetti-x' as string]: `${xOffsets[index % 3]}px`,
            }}
          />
        )
      })}
    </div>
  )
}
