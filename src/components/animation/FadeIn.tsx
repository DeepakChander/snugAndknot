'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

interface FadeInProps {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'fade-up' | 'scale'
  delay?: number
  once?: boolean
}

export default function FadeIn({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !ref.current) return
    const el = ref.current

    const fromVars =
      variant === 'fade-up' ? { opacity: 0, y: 40 }
      : variant === 'scale' ? { opacity: 0, scale: 0.95 }
      : { opacity: 0 }

    const toVars =
      variant === 'fade-up' ? { opacity: 1, y: 0 }
      : variant === 'scale' ? { opacity: 1, scale: 1 }
      : { opacity: 1 }

    gsap.set(el, fromVars)
    gsap.to(el, {
      ...toVars,
      duration: 0.6,
      delay,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [variant, delay, once, reducedMotion])

  return (
    <div
      ref={ref}
      className={className}
      style={reducedMotion ? undefined : { opacity: 0 }}
    >
      {children}
    </div>
  )
}
