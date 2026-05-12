'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#1E4D7B', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#03A9F4']
const PIECE_COUNT = 30

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
    left: 35 + Math.random() * 30,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.15,
    duration: 1.1 + Math.random() * 0.6,
    size: 4 + Math.random() * 4,
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 220,
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
    }, 2000)
    return () => window.clearTimeout(t)
  }, [active, onDone])

  if (!show) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 9999 }}>
      <style>{`
        @keyframes confetti-burst {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift, 0px), 65vh, 0) rotate(540deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '55vh',
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.5}px`,
            background: p.color,
            borderRadius: '1.5px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-burst ${p.duration}s ${p.delay}s cubic-bezier(.16,.84,.44,1) forwards`,
            ['--drift' as never]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
