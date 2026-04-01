'use client'

import { motion } from 'framer-motion'

function FloatingPath({ d, delay = 0, duration = 20, strokeWidth = 1 }: {
  d: string
  delay?: number
  duration?: number
  strokeWidth?: number
}) {
  return (
    <motion.path
      d={d}
      stroke="#93c5fd"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 0.5, 0.5, 0] }}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 2,
      }}
    />
  )
}

const paths = [
  { d: 'M-100 200 C100 150, 300 250, 500 180 S700 120, 900 160 S1100 220, 1400 180', delay: 0, duration: 22 },
  { d: 'M-150 350 C50 300, 250 400, 450 330 S650 270, 850 310 S1050 370, 1350 330', delay: 2, duration: 25 },
  { d: 'M0 500 C200 450, 400 550, 600 480 S800 420, 1000 460 S1200 520, 1440 480', delay: 4, duration: 20 },
  { d: 'M-50 100 C150 50, 350 150, 550 80 S750 20, 950 60 S1150 120, 1450 80', delay: 1, duration: 28 },
  { d: 'M100 650 C300 600, 500 700, 700 630 S900 570, 1100 610 S1300 670, 1500 630', delay: 3, duration: 24 },
  { d: 'M-200 420 C0 370, 200 470, 400 400 S600 340, 800 380 S1000 440, 1300 400', delay: 5, duration: 26 },
  { d: 'M50 280 C250 230, 450 330, 650 260 S850 200, 1050 240 S1250 300, 1500 260', delay: 1.5, duration: 23 },
  { d: 'M-100 560 C100 510, 300 610, 500 540 S700 480, 900 520 S1100 580, 1400 540', delay: 6, duration: 21 },
  { d: 'M200 80 C400 30, 600 130, 800 60 S1000 0, 1200 40 S1400 100, 1600 60', delay: 0.5, duration: 27 },
  { d: 'M-50 720 C150 670, 350 770, 550 700 S750 640, 950 680 S1150 740, 1450 700', delay: 4.5, duration: 22 },
  { d: 'M0 160 C200 110, 400 210, 600 140 S800 80, 1000 120 S1200 180, 1500 140', delay: 2.5, duration: 29 },
  { d: 'M100 460 C300 410, 500 510, 700 440 S900 380, 1100 420 S1300 480, 1500 440', delay: 7, duration: 20 },
  { d: 'M-150 600 C50 550, 250 650, 450 580 S650 520, 850 560 S1050 620, 1350 580', delay: 3.5, duration: 25 },
  { d: 'M50 380 C250 330, 450 430, 650 360 S850 300, 1050 340 S1250 400, 1500 360', delay: 8, duration: 24 },
  { d: 'M-100 240 C100 190, 300 290, 500 220 S700 160, 900 200 S1100 260, 1400 220', delay: 6.5, duration: 26 },
]

export function BackgroundPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((p, i) => (
          <FloatingPath
            key={i}
            d={p.d}
            delay={p.delay}
            duration={p.duration}
            strokeWidth={i % 3 === 0 ? 1.5 : 1}
          />
        ))}
      </svg>
    </div>
  )
}
