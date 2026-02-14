'use client'

import { useState, useEffect } from 'react'

export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const current = window.scrollY
      setScrollY(current)
      setDirection(current > lastScrollY ? 'down' : 'up')
      lastScrollY = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { direction, scrollY }
}
