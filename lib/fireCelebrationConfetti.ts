'use client'

import confetti from 'canvas-confetti'

export function fireCelebrationConfetti() {
  const duration = 1500
  const end = Date.now() + duration

  function frame() {
    confetti({
      particleCount: 4,
      spread: 60,
      startVelocity: 35,
      scalar: 0.95,
      origin: { x: 0.15 + Math.random() * 0.7, y: Math.random() * 0.2 + 0.15 },
    })

    confetti({
      particleCount: 3,
      spread: 80,
      startVelocity: 28,
      scalar: 0.8,
      origin: { x: Math.random(), y: Math.random() * 0.15 + 0.05 },
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
