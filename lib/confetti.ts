export function fireConfetti(): void {
  import('canvas-confetti').then((mod) => {
    mod.default({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#1E4D7B', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#03A9F4'],
    })
  })
}
