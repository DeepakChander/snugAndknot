'use client'

import { useEffect, useState } from 'react'

/** True while `ref` is within `rootMargin` of the viewport. Used to pause WebGL off-screen. */
export function useInView(ref: React.RefObject<Element | null>, rootMargin = '200px 0px', once = false) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once])
  return inView
}
