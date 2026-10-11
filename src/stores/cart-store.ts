'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine } from '@/types/commerce'

/** Legacy coupon shape still used by the old checkout until it is rebuilt. */
interface LegacyCoupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  description: string
  expiresAt: string
}

/** Matches the server's per-order cap (MAX_LINE_QTY in src/server/validation.ts). */
const MAX_QTY = 10

interface CartStore {
  items: CartLine[]
  isOpen: boolean
  couponCode: string | null
  /** Bumped whenever a line is added — the bag icon listens to pulse. */
  lastAddedAt: number
  addItem: (item: Omit<CartLine, 'id'> & { id?: string }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  setCouponCode: (code: string | null) => void
  totalItems: () => number
  totalPrice: () => number
  // Legacy API (old checkout)
  appliedCoupon: LegacyCoupon | null
  applyCoupon: (coupon: LegacyCoupon) => void
  removeCoupon: () => void
  discountAmount: () => number
  finalTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      lastAddedAt: 0,
      appliedCoupon: null,

      addItem: (item) => {
        const id = item.variantId
        const items = get().items
        const existing = items.find((i) => i.id === id)
        const next = existing
          ? items.map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + item.quantity) } : i))
          : [...items, { ...item, id, size: item.size ?? null, color: item.color ?? null, quantity: Math.min(MAX_QTY, item.quantity) }]
        set({ items: next, lastAddedAt: Date.now() })
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) return get().removeItem(id)
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)) })
      },

      clearCart: () => set({ items: [], couponCode: null, appliedCoupon: null }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCouponCode: (code) => set({ couponCode: code ? code.trim().toUpperCase() : null }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => Math.round(get().items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,

      applyCoupon: (coupon) => set({ appliedCoupon: coupon, couponCode: coupon.code }),
      removeCoupon: () => set({ appliedCoupon: null, couponCode: null }),
      discountAmount: () => {
        const c = get().appliedCoupon
        if (!c) return 0
        const total = get().totalPrice()
        return Math.round(Math.min(total, c.type === 'percentage' ? (total * c.value) / 100 : c.value) * 100) / 100
      },
      finalTotal: () => Math.max(0, get().totalPrice() - get().discountAmount()),
    }),
    {
      name: 'snug-knot-cart',
      version: 3,
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
      // v1 lines had timestamped ids; v2 keys each line by its variant; v3 lowers the per-line cap to 10.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as { items?: (CartLine & { size?: string; color?: string })[] }
        if (version < 2 && Array.isArray(state.items)) {
          const merged = new Map<string, CartLine>()
          for (const i of state.items) {
            if (!i?.variantId) continue
            const prev = merged.get(i.variantId)
            merged.set(i.variantId, {
              ...i,
              id: i.variantId,
              size: i.size ?? null,
              color: i.color ?? null,
              quantity: Math.min(MAX_QTY, (prev?.quantity ?? 0) + (i.quantity || 1)),
            })
          }
          return { items: Array.from(merged.values()), couponCode: null }
        }
        const items = Array.isArray(state.items) ? state.items.map((i) => ({ ...i, quantity: Math.min(MAX_QTY, i.quantity) })) : []
        return { ...(state as { couponCode: string | null }), items }
      },
    }
  )
)
