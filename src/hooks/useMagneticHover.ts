'use client'

import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'

export function useMagneticHover(strength: number = 0.3) {
  const ref = useRef<HTMLButtonElement>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(ref.current, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out',
      })
    },
    [strength]
  )

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
