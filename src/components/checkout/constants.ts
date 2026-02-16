import type { CheckoutStep } from '@/types'

export const STEPS: { key: CheckoutStep; label: string; number: number }[] = [
  { key: 'information', label: 'Information', number: 1 },
  { key: 'shipping', label: 'Shipping', number: 2 },
  { key: 'payment', label: 'Payment', number: 3 },
  { key: 'review', label: 'Review', number: 4 },
]

export const STEP_INDEX: Record<CheckoutStep, number> = {
  information: 0,
  shipping: 1,
  payment: 2,
  review: 3,
}
