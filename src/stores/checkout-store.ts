'use client'

import { create } from 'zustand'
import type { CheckoutStep, Address } from '@/types'

interface CheckoutStore {
  currentStep: CheckoutStep
  shippingAddress: Partial<Address>
  shippingMethod: 'standard' | 'express'
  paymentMethod: 'card' | 'paypal'
  isProcessing: boolean
  orderComplete: boolean
  orderNumber: string | null
  setStep: (step: CheckoutStep) => void
  nextStep: () => void
  prevStep: () => void
  setShippingAddress: (address: Partial<Address>) => void
  setShippingMethod: (method: 'standard' | 'express') => void
  setPaymentMethod: (method: 'card' | 'paypal') => void
  placeOrder: () => Promise<string>
  reset: () => void
}

const STEPS: CheckoutStep[] = ['information', 'shipping', 'payment', 'review']

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  currentStep: 'information',
  shippingAddress: {},
  shippingMethod: 'standard',
  paymentMethod: 'card',
  isProcessing: false,
  orderComplete: false,
  orderNumber: null,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const idx = STEPS.indexOf(get().currentStep)
    if (idx < STEPS.length - 1) set({ currentStep: STEPS[idx + 1] })
  },

  prevStep: () => {
    const idx = STEPS.indexOf(get().currentStep)
    if (idx > 0) set({ currentStep: STEPS[idx - 1] })
  },

  setShippingAddress: (address) => set({ shippingAddress: address }),
  setShippingMethod: (method) => set({ shippingMethod: method }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  placeOrder: async () => {
    set({ isProcessing: true })
    await new Promise((r) => setTimeout(r, 2000))
    const orderNumber = `SNK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    set({ isProcessing: false, orderComplete: true, orderNumber })
    return orderNumber
  },

  reset: () =>
    set({
      currentStep: 'information',
      shippingAddress: {},
      shippingMethod: 'standard',
      paymentMethod: 'card',
      isProcessing: false,
      orderComplete: false,
      orderNumber: null,
    }),
}))
