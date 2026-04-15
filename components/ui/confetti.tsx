'use client'

import { useEffect, useState } from 'react'
import Lottie from 'react-lottie'

interface ConfettiProps {
  isActive?: boolean
  duration?: number
  autoPlay?: boolean
  zIndex?: number
  loop?: boolean
}

const animationData = {
  v: '5.5.8',
  fr: 30,
  ip: 0,
  op: 90,
  w: 1200,
  h: 1200,
  nm: 'Score Confetti',
  ddd: 0,
  assets: [],
  layers: [
    ...Array.from({ length: 42 }).map((_, index) => {
      const colors = [
        [0.0549, 0.6784, 1, 1],
        [0, 0.9059, 0.6588, 1],
        [0.9765, 0.8039, 0.2235, 1],
        [1, 0.298, 0.3608, 1],
      ]
      const x = 120 + ((index * 83) % 960)
      const delay = index % 18
      const width = 18 + (index % 3) * 5
      const height = 9 + (index % 4) * 4

      return {
        ddd: 0,
        ind: index + 1,
        ty: 4,
        nm: `Confetti ${index + 1}`,
        sr: 1,
        ks: {
          o: { a: 0, k: 100, ix: 11 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [index * 19] },
              { t: 90, s: [index * 19 + 540] },
            ],
            ix: 10,
          },
          p: {
            a: 1,
            k: [
              { t: 0, s: [x, -80 - delay * 18, 0] },
              { t: 90, s: [x + ((index % 5) - 2) * 55, 1280, 0] },
            ],
            ix: 2,
          },
          a: { a: 0, k: [0, 0, 0], ix: 1 },
          s: { a: 0, k: [100, 100, 100], ix: 6 },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'rc',
                d: 1,
                s: { a: 0, k: [width, height], ix: 2 },
                p: { a: 0, k: [0, 0], ix: 3 },
                r: { a: 0, k: 2, ix: 4 },
                nm: 'Rectangle Path 1',
                mn: 'ADBE Vector Shape - Rect',
                hd: false,
              },
              {
                ty: 'fl',
                c: { a: 0, k: colors[index % colors.length], ix: 4 },
                o: { a: 0, k: 100, ix: 5 },
                r: 1,
                bm: 0,
                nm: 'Fill 1',
                mn: 'ADBE Vector Graphic - Fill',
                hd: false,
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0], ix: 2 },
                a: { a: 0, k: [0, 0], ix: 1 },
                s: { a: 0, k: [100, 100], ix: 3 },
                r: { a: 0, k: 0, ix: 6 },
                o: { a: 0, k: 100, ix: 7 },
                sk: { a: 0, k: 0, ix: 4 },
                sa: { a: 0, k: 0, ix: 5 },
                nm: 'Transform',
              },
            ],
            nm: 'Rectangle 1',
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: 'ADBE Vector Group',
            hd: false,
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0,
      }
    }),
  ],
  markers: [],
}

export default function Confetti({
  isActive: externalIsActive,
  duration = 6000,
  autoPlay = false,
  zIndex = 50,
  loop = false,
}: ConfettiProps) {
  const [isActive, setIsActive] = useState(autoPlay)

  useEffect(() => {
    if (externalIsActive !== undefined) {
      setIsActive(externalIsActive)
    }
  }, [externalIsActive])

  useEffect(() => {
    let timeoutId: number | undefined

    if (isActive && !loop && duration > 0) {
      timeoutId = window.setTimeout(() => {
        setIsActive(false)
      }, duration)
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [isActive, duration, loop])

  const lottieOptions = {
    loop,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex }}>
      <Lottie options={lottieOptions} height="100%" width="100%" isStopped={!isActive} />
    </div>
  )
}
