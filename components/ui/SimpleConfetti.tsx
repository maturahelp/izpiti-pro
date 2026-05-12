'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#1E4D7B', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#03A9F4', '#E91E63', '#00BCD4']
const PIECE_COUNT = 80

type Piece = {
  id: number
  left: number
  color: string
  delay: number
  duration: number
  size: number
  rotate: number
  drift: number
}

function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.3,
    duration: 2.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 200,
  }))
}

export default function SimpleConfetti({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) {
      setShow(false)
      return
    }
    setPieces(generatePieces())
    setShow(true)
    const t = window.setTimeout(() => {
      setShow(false)
      onDone?.()
    }, 4500)
    return () => window.clearTimeout(t)
  }, [active, onDone])

  if (!show) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 9999 }}>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift, 0px), 110vh, 0) rotate(720deg); opacity: 0.8; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            background: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s cubic-bezier(.1,.4,.3,1) forwards`,
            // CSS custom property for horizontal drift, picked up by the keyframe
            ['--drift' as never]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
