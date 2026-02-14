'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

interface TextRevealProps {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  className?: string
  delay?: number
  splitBy?: 'words' | 'chars'
  animation?: 'slide-up' | 'blur-in' | 'fade-up'
}

export default function TextReveal({
  children,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  splitBy = 'words',
  animation = 'slide-up',
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const el = containerRef.current
    const text = el.textContent || ''

    // Split text into spans
    const units = splitBy === 'words' ? text.split(' ') : text.split('')
    el.innerHTML = units
      .map(
        (unit) =>
          `<span class="inline-block overflow-hidden"><span class="inline-block text-reveal-unit">${unit}${splitBy === 'words' ? '&nbsp;' : ''}</span></span>`
      )
      .join('')

    const targets = el.querySelectorAll('.text-reveal-unit')

    const getAnimation = () => {
      switch (animation) {
        case 'blur-in':
          return {
            from: { y: '100%', opacity: 0, filter: 'blur(8px)' },
            to: { y: '0%', opacity: 1, filter: 'blur(0px)' },
          }
        case 'fade-up':
          return {
            from: { y: 20, opacity: 0 },
            to: { y: 0, opacity: 1 },
          }
        case 'slide-up':
        default:
          return {
            from: { y: '110%' },
            to: { y: '0%' },
          }
      }
    }

    const { from, to } = getAnimation()

    gsap.fromTo(targets, from, {
      ...to,
      duration: 0.8,
      stagger: splitBy === 'words' ? 0.05 : 0.02,
      ease: 'expo.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [children, splitBy, animation, delay, reducedMotion])

  return (
    <Tag ref={containerRef as React.RefObject<HTMLHeadingElement>} className={className}>
      {children}
    </Tag>
  )
}
