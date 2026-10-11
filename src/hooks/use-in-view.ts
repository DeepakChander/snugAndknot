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

let webglCache: boolean | null = null

/** One cheap probe per page load; the context is released immediately. */
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    webglCache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}
