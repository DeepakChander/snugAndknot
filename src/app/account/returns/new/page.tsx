'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'
import type { Order, ReturnReason } from '@/types'
import ordersData from '@/data/orders.json'
import FadeIn from '@/components/animation/FadeIn'
import TextReveal from '@/components/animation/TextReveal'

/* ------------------------------------------------
   Constants
   ------------------------------------------------ */
const allOrders = ordersData as Order[]
const deliveredOrders = allOrders.filter((o) => o.status === 'delivered')

const returnReasons: { value: ReturnReason; label: string; icon: ReactNode }[] = [
  {
    value: 'wrong-size',
    label: 'Wrong Size',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    value: 'defective',
    label: 'Defective',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    value: 'not-as-described',
    label: 'Not as Described',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
      </svg>
    ),
  },
  {
    value: 'changed-mind',
    label: 'Changed Mind',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    value: 'other',
    label: 'Other',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

const steps = ['Select Order', 'Select Reason', 'Confirm']

/* ------------------------------------------------
   Component
   ------------------------------------------------ */
export default function NewReturnPage() {
  const router = useRouter()
  const addToast = useUIStore((s) => s.addToast)

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedReason, setSelectedReason] = useState<ReturnReason | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* ---- Step navigation ---- */
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 2))
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0))

  /* ---- Submit return ---- */
  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200))
    addToast('Return request submitted successfully!', 'success')
    router.push('/account/returns')
  }

  /* ---- Reason label lookup ---- */
  const reasonLabel = returnReasons.find((r) => r.value === selectedReason)?.label ?? ''

  return (
    <main className="page-content min-h-screen bg-ivory">
      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-16 lg:py-24">

        {/* ---- Header ---- */}
        <div className="mb-10">
          <TextReveal as="h1" className="font-heading text-3xl lg:text-4xl text-burgundy mb-2">
            Start a Return
          </TextReveal>
          <FadeIn delay={0.15}>
            <p className="text-burgundy/60">
              Follow the steps below to submit your return request.
            </p>
          </FadeIn>
        </div>

        {/* ---- Step Indicator ---- */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-center gap-0 mb-12">
            {steps.map((label, i) => {
              const isActive = i === currentStep
              const isComplete = i < currentStep
              return (
                <div key={label} className="flex items-center">
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-burgundy text-gold'
                          : isComplete
                          ? 'bg-gold text-burgundy-deep'
                          : 'bg-burgundy/8 text-burgundy/40'
                      }`}
                    >
                      {isComplete ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                        isActive ? 'text-burgundy' : 'text-burgundy/40'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-[2px] mx-3 mb-6 transition-colors duration-300 ${
                        i < currentStep ? 'bg-gold' : 'bg-burgundy/10'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </FadeIn>

        {/* ============================================
            STEP 1: Select Order
            ============================================ */}
        {currentStep === 0 && (
          <FadeIn>
            <div className="space-y-4">
              {deliveredOrders.length === 0 ? (
                <div className="glass rounded-xl border border-burgundy/8 p-12 text-center">
                  <p className="text-burgundy/50 mb-4">
                    No delivered orders found to return.
                  </p>
                  <Link
                    href="/shop"
                    className="text-sm font-medium text-burgundy hover:text-gold-muted transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                deliveredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left glass rounded-xl border-2 p-5 transition-all duration-300 ${
                        isSelected
                          ? 'border-gold bg-gold/5'
                          : 'border-burgundy/8 hover:border-burgundy/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-sm font-semibold text-burgundy">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-burgundy/40">
                          Delivered{' '}
                          {order.deliveredAt
                            ? new Date(order.deliveredAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-burgundy/5 overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-burgundy truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-burgundy/40">
                                ${item.price} &middot; Size {item.size}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold-muted">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Selected
                        </div>
                      )}
                    </button>
                  )
                })
              )}

              {/* Next button */}
              {deliveredOrders.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={goNext}
                    disabled={!selectedOrder}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-gold rounded-full font-medium text-sm tracking-wide hover:bg-burgundy-deep transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* ============================================
            STEP 2: Select Reason
            ============================================ */}
        {currentStep === 1 && (
          <FadeIn>
            <div>
              <h2 className="font-heading text-xl text-burgundy mb-6">
                Why are you returning this item?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {returnReasons.map((reason) => {
                  const isSelected = selectedReason === reason.value
                  return (
                    <button
                      key={reason.value}
                      onClick={() => setSelectedReason(reason.value)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 text-center ${
                        isSelected
                          ? 'border-gold bg-gold/8 text-burgundy'
                          : 'border-burgundy/8 bg-ivory hover:border-burgundy/20 text-burgundy/60'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isSelected ? 'bg-gold/20 text-burgundy' : 'bg-burgundy/5 text-burgundy/40'
                        }`}
                      >
                        {reason.icon}
                      </div>
                      <span className="font-medium text-sm">
                        {reason.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 text-sm text-burgundy/50 hover:text-burgundy transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={goNext}
                  disabled={!selectedReason}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-gold rounded-full font-medium text-sm tracking-wide hover:bg-burgundy-deep transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ============================================
            STEP 3: Confirmation
            ============================================ */}
        {currentStep === 2 && selectedOrder && (
          <FadeIn>
            <div>
              <h2 className="font-heading text-xl text-burgundy mb-6">
                Confirm Your Return
              </h2>

              <div className="glass rounded-xl border border-burgundy/8 p-6 mb-8">
                {/* Order info */}
                <div className="mb-5 pb-5 border-b border-burgundy/6">
                  <p className="text-xs uppercase tracking-wider text-burgundy/40 mb-1">
                    Order
                  </p>
                  <p className="font-mono text-sm font-semibold text-burgundy">
                    {selectedOrder.orderNumber}
                  </p>
                </div>

                {/* Items */}
                <div className="mb-5 pb-5 border-b border-burgundy/6">
                  <p className="text-xs uppercase tracking-wider text-burgundy/40 mb-3">
                    Items to Return
                  </p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-burgundy/5 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-burgundy truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-burgundy/40">
                            Size {item.size} &middot; {item.color} &middot; Qty {item.quantity}
                          </p>
                        </div>
                        <p className="font-mono text-sm text-burgundy">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-5 pb-5 border-b border-burgundy/6">
                  <p className="text-xs uppercase tracking-wider text-burgundy/40 mb-1">
                    Reason
                  </p>
                  <p className="text-sm font-medium text-burgundy">
                    {reasonLabel}
                  </p>
                </div>

                {/* Estimated refund */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-burgundy/40 mb-1">
                    Estimated Refund
                  </p>
                  <p className="font-heading text-2xl text-burgundy">
                    ${selectedOrder.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-burgundy/40 mt-1">
                    Refund will be processed within 5-10 business days after we receive the item.
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 text-sm text-burgundy/50 hover:text-burgundy transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy text-gold rounded-full font-medium text-sm tracking-wide hover:bg-burgundy-deep transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Return
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ---- Back link ---- */}
        <FadeIn delay={0.4}>
          <div className="mt-12">
            <Link
              href="/account/returns"
              className="inline-flex items-center gap-2 text-sm text-burgundy/50 hover:text-burgundy transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Returns
            </Link>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
