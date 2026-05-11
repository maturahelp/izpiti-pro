'use client'

import confetti from 'canvas-confetti'

export function fireConfetti(): void {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 40,
    ticks: 200,
    scalar: 0.85,
    colors: ['#1E4D7B', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#03A9F4'],
  })
}
