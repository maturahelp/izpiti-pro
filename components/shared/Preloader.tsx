'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const pathname = usePathname()
  const isFirstLoad = useRef(true)
  const previousPath = useRef(pathname)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }

  const show = () => {
    clearTimers()
    setFading(false)
    setVisible(true)
  }

  const hide = (delay = 400) => {
    clearTimers()
    fadeTimer.current = setTimeout(() => {
      setFading(true)
      hideTimer.current = setTimeout(() => setVisible(false), 600)
    }, delay)
  }

  useEffect(() => {
    const handleLoad = () => hide(1600)

    if (document.readyState === 'complete') {
      handleLoad()
      return undefined
    }

    window.addEventListener('load', handleLoad)
    return () => {
      window.removeEventListener('load', handleLoad)
      clearTimers()
    }
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return

      show()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      previousPath.current = pathname
      return
    }

    if (pathname !== previousPath.current) {
      previousPath.current = pathname
      hide(200)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className={`preloader-overlay ${fading ? 'preloader-fade-out' : ''}`} aria-hidden="true">
      <svg className="preloader-svg" viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="preloader-reveal">
            <rect className="preloader-reveal-rect" x="0" y="0" height="80" />
          </clipPath>
        </defs>

        <text
          className="preloader-text-stroke"
          x="300"
          y="58"
          textAnchor="middle"
          clipPath="url(#preloader-reveal)"
        >
          MaturaHelp
        </text>
        <text className="preloader-text-fill" x="300" y="58" textAnchor="middle">
          MaturaHelp
        </text>
      </svg>
    </div>
  )
}
