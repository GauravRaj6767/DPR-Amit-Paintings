'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // Pathname changed — page has loaded, finish the bar
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      setWidth(100)
      const t = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [pathname])

  // Expose a way to start the bar from Link clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      // Only trigger for internal same-origin navigations
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return

      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)

      setVisible(true)
      setWidth(10)

      let current = 10
      intervalRef.current = setInterval(() => {
        // Ease toward 85% but never reach 100 until page loads
        current = current + (85 - current) * 0.08
        setWidth(current)
      }, 100)
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 2, pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #f5a623, #ffca6e)',
        transition: width === 100 ? 'width 0.15s ease-out' : 'width 0.1s linear',
        boxShadow: '0 0 8px rgba(245,166,35,0.7)',
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}
