'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent, EVENTS } from '@/lib/analytics'

export default function AnalyticsProvider() {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent(EVENTS.PAGE_VIEW, { path: pathname })
  }, [pathname])

  return null
}
