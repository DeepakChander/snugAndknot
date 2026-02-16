'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, type MouseEvent } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'

/**
 * Navigation link with exit animation.
 * Use for major nav links (header, footer, CTAs). Regular links can use next/link directly.
 */
export default function TransitionLink({
  href,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  const router = useRouter()

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()

      const curtain = document.querySelector('[data-transition-curtain]') as HTMLElement
      if (!curtain) {
        router.push(href.toString())
        return
      }

      const lenisStop = useUIStore.getState().lenisStop
      lenisStop?.()

      // Exit animation: curtain wipes in from left
      gsap.fromTo(
        curtain,
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => router.push(href.toString()),
        }
      )
    },
    [href, router]
  )

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  )
}
