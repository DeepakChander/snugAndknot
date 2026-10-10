'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

/** Re-render server components (account pages, personalised data) when the session changes. */
export default function AuthRefresher() {
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const status = useAuthStore((s) => s.status)
  const last = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (status !== 'ready') return
    if (last.current === undefined) {
      last.current = userId
      return
    }
    if (last.current !== userId) {
      last.current = userId
      router.refresh()
    }
  }, [userId, status, router])

  return null
}
