'use client'

import confetti from 'canvas-confetti'

type RectLike = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>

export function rainbowMinimalConfetti(rect: RectLike) {
  if (typeof window === 'undefined') return

  confetti({
    particleCount: 28,
    spread: 35,
    startVelocity: 18,
    decay: 0.92,
    ticks: 110,
    gravity: 1.2,
    scalar: 1.2,
    shapes: ['square'],
    colors: [
      '#ff4d4d',
      '#ff944d',
      '#ffd24d',
      '#4dff88',
      '#4db8ff',
      '#a64dff',
    ],
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
  })
}

export function rainbowMinimalConfettiFromElement(element: Element | null) {
  if (!element) return
  rainbowMinimalConfetti(element.getBoundingClientRect())
}
