'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

/** Read/write shop filters in the URL so results are shareable and server-rendered. */
export function useQueryState() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const set = useCallback(
    (patch: Record<string, string | string[] | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(patch)) {
        next.delete(k)
        if (v === null) continue
        if (Array.isArray(v)) v.forEach((x) => next.append(k, x))
        else if (v !== '') next.set(k, v)
      }
      const qs = next.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [params, pathname, router]
  )

  return { params, set, pending }
}
