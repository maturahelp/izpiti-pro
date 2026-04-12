'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const pathname = usePathname()
  const isFirstLoad = useRef(true)
  const prevPath = useRef(pathname)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setFading(false)
    setVisible(true)
  }

  const hide = (delay = 400) => {
    fadeTimer.current = setTimeout(() => {
      setFading(true)
      hideTimer.current = setTimeout(() => setVisible(false), 600)
    }, delay)
  }

  // Initial page load
  useEffect(() => {
    const handleLoad = () => hide(1600)
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  // Route transitions — intercept internal <a> clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      show()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Hide after new route renders
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      prevPath.current = pathname
      return
    }
    if (pathname !== prevPath.current) {
      prevPath.current = pathname
      hide(200)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className={`preloader-overlay ${fading ? 'preloader-fade-out' : ''}`}
      aria-hidden="true"
    >
      <svg
        className="preloader-svg"
        viewBox="0 0 600 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text className="preloader-text-glow" x="300" y="58" textAnchor="middle" filter="url(#glow)">
          MaturaHelp
        </text>
        <text className="preloader-text-stroke" x="300" y="58" textAnchor="middle">
          MaturaHelp
        </text>
        <text className="preloader-text-fill" x="300" y="58" textAnchor="middle">
          MaturaHelp
        </text>
      </svg>
    </div>
  )
}
