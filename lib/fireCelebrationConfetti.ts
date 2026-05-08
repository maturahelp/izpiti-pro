export function fireCelebrationConfetti() {
  import('canvas-confetti').then((mod) => {
    const confetti = mod.default
    const duration = 1500
    const end = Date.now() + duration
    const colors = ['#2F6FED', '#16A34A', '#F59E0B', '#EF4444', '#14B8A6', '#E11D48']

    function frame() {
      confetti({
        particleCount: 4,
        spread: 60,
        startVelocity: 35,
        scalar: 0.95,
        colors,
        zIndex: 2147483647,
        origin: { x: 0.15 + Math.random() * 0.7, y: Math.random() * 0.2 + 0.15 },
      })

      confetti({
        particleCount: 3,
        spread: 80,
        startVelocity: 28,
        scalar: 0.8,
        colors,
        zIndex: 2147483647,
        origin: { x: Math.random(), y: Math.random() * 0.15 + 0.05 },
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  })
}
