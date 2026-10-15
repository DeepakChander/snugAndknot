'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useCartStore } from '@/stores/cart-store'
import { useCurrency } from '@/components/providers/SettingsProvider'
import type { Quote, ShippingMethod } from '@/types/commerce'

/**
 * Prices the bag on the server (debounced). Server prices win: local lines are updated
 * to match, sold-out lines are removed and quantities clamped to stock, with notices.
 */
export function useCartQuote(opts: { enabled?: boolean; shippingMethod?: ShippingMethod; couponCode?: string | null } = {}) {
  const { enabled = true, shippingMethod = 'standard' } = opts
  const items = useCartStore((s) => s.items)
  const storeCoupon = useCartStore((s) => s.couponCode)
  const couponCode = opts.couponCode === undefined ? storeCoupon : opts.couponCode
  // Re-priced whenever the shopper switches currency; local lines then take the new prices.
  const currency = useCurrency().currency.code
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notices, setNotices] = useState<string[]>([])
  const seq = useRef(0)

  const key = JSON.stringify([items.map((i) => [i.variantId, i.quantity]), couponCode, shippingMethod, currency])

  useEffect(() => {
    if (!enabled) return
    if (!items.length) {
      setQuote(null)
      return
    }
    const id = ++seq.current
    const ctrl = new AbortController()
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const { quote: q } = await api<{ quote: Quote }>('/api/cart/quote', {
          body: { lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), couponCode, shippingMethod, currency },
          signal: ctrl.signal,
        })
        if (id !== seq.current) return
        setError(null)
        setQuote(q)
        // Reconcile local bag with server truth.
        const store = useCartStore.getState()
        const byId = new Map(q.lines.map((l) => [l.variantId, l]))
        let changed = false
        const next = store.items
          .filter((i) => {
            const keep = byId.has(i.variantId)
            if (!keep) changed = true
            return keep
          })
          .map((i) => {
            const l = byId.get(i.variantId)!
            if (l.price !== i.price || l.quantity !== i.quantity || l.title !== i.title || l.image !== i.image) {
              changed = true
              return { ...i, price: l.price, quantity: l.quantity, title: l.title, image: l.image || i.image }
            }
            return i
          })
        if (changed) useCartStore.setState({ items: next })
        if (q.issues.length) setNotices(q.issues)
      } catch (err) {
        if ((err as Error).name === 'AbortError' || id !== seq.current) return
        setError((err as Error).message)
      } finally {
        if (id === seq.current) setLoading(false)
      }
    }, 250)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { quote, loading, error, notices, dismissNotices: () => setNotices([]) }
}
