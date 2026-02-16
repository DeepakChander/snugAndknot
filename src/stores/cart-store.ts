'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Coupon } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: Coupon | null
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  discountAmount: () => number
  finalTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      addItem: (item) => {
        const items = get().items
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )

        if (existingIndex > -1) {
          const updated = [...items]
          updated[existingIndex].quantity += item.quantity
          set({ items: updated })
        } else {
          set({
            items: [...items, { ...item, id: `${item.productId}-${item.variantId}-${Date.now()}` }],
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      discountAmount: () => {
        const coupon = get().appliedCoupon
        if (!coupon) return 0
        const subtotal = get().totalPrice()
        if (subtotal < coupon.minPurchase) return 0
        if (coupon.type === 'percentage') return Math.round((subtotal * coupon.value) / 100 * 100) / 100
        return Math.min(coupon.value, subtotal)
      },

      finalTotal: () => {
        return Math.max(0, get().totalPrice() - get().discountAmount())
      },
    }),
    {
      name: 'snug-knot-cart',
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
)
