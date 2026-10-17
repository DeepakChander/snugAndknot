'use client'

import { useEffect, useState } from 'react'
import ClientReviews, { type HomeReview } from './ClientReviews'

const KEY = 'sk-showcase'

/**
 * The home page reviews section in the private client showcase: opened with the secret link
 * (/?showcase=…), it shows the sample reviews, each tagged Sample. The link is remembered in this
 * browser so the client can move around the site and come back; for everyone else nothing renders.
 * Only used while the shop has no real reviews.
 */
export default function ShowcaseReviews() {
  const [data, setData] = useState<{ reviews: HomeReview[]; average: number; count: number } | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const fromLink = url.searchParams.get('showcase')
    let token = fromLink
    try {
      if (fromLink) window.localStorage.setItem(KEY, fromLink)
      else token = window.localStorage.getItem(KEY)
    } catch {}
    if (fromLink) {
      // Keep the secret out of the address bar (and out of anything the client copies from it).
      url.searchParams.delete('showcase')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
    if (!token) return
    let live = true
    fetch(`/api/showcase?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!live) return
        if (d?.reviews?.length) setData(d)
        else {
          // A link that was switched off or replaced stops working here too.
          try {
            window.localStorage.removeItem(KEY)
          } catch {}
        }
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  return data ? <ClientReviews reviews={data.reviews} average={data.average} count={data.count} sample /> : null
}
