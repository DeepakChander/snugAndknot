'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCheckoutStore } from '@/stores/checkout-store'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import CouponInput from '@/components/checkout/CouponInput'
import StepIndicator from '@/components/checkout/StepIndicator'
import InformationStep from '@/components/checkout/InformationStep'
import ShippingStep from '@/components/checkout/ShippingStep'
import PaymentStep from '@/components/checkout/PaymentStep'
import ReviewStep from '@/components/checkout/ReviewStep'
import OrderConfirmation from '@/components/checkout/OrderConfirmation'
import { STEP_INDEX } from '@/components/checkout/constants'
import { formatPrice } from '@/lib/utils'
import type { Coupon } from '@/types'

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [isAnimating, setIsAnimating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [discount, setDiscount] = useState(0)

  const {
    currentStep,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    isProcessing,
    orderComplete,
    orderNumber,
    setShippingAddress,
    setShippingMethod,
    setPaymentMethod,
    placeOrder,
    nextStep,
    prevStep,
    reset,
  } = useCheckoutStore()

  const { items, totalPrice, clearCart } = useCartStore()
  const addToast = useUIStore((s) => s.addToast)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const subtotal = totalPrice()
  const shippingCost = shippingMethod === 'express' ? 12 : 0
  const total = subtotal - discount + shippingCost
  const currentIndex = STEP_INDEX[currentStep]

  const handleNext = () => {
    setSlideDirection('left')
    setIsAnimating(true)
    setTimeout(() => { nextStep(); setIsAnimating(false) }, 300)
  }

  const handlePrev = () => {
    setSlideDirection('right')
    setIsAnimating(true)
    setTimeout(() => { prevStep(); setIsAnimating(false) }, 300)
  }

  const handlePlaceOrder = async () => {
    const orderNum = await placeOrder()
    clearCart()
    addToast(`Order ${orderNum} placed successfully!`, 'success')
  }

  const handleCouponApply = (coupon: Coupon, discountAmount: number) => {
    setAppliedCoupon(coupon)
    setDiscount(discountAmount)
  }

  const handleCouponRemove = () => {
    setAppliedCoupon(null)
    setDiscount(0)
  }

  // ─── Order Confirmation ───
  if (orderComplete && orderNumber) {
    return <OrderConfirmation orderNumber={orderNumber} onReset={reset} />
  }

  // ─── Empty Cart Guard ───
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory pt-24 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-dust mb-6">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <h1 className="font-heading text-3xl text-burgundy mb-3">Your cart is empty</h1>
          <p className="text-wine mb-8">Add some items to your bag before checking out.</p>
          <Link href="/shop" className="inline-flex px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Link href="/cart" className="text-sm text-wine hover:text-burgundy transition-colors flex items-center gap-1.5 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-burgundy">Checkout</h1>
        </div>

        <StepIndicator currentIndex={currentIndex} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10">
          {/* Left Column — Form Content */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div
              ref={contentRef}
              className={`transition-all duration-300 ease-[var(--ease-loom-settle)] ${
                isAnimating
                  ? slideDirection === 'left'
                    ? 'opacity-0 -translate-x-8'
                    : 'opacity-0 translate-x-8'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              {currentStep === 'information' && (
                <InformationStep address={shippingAddress} onUpdate={setShippingAddress} onNext={handleNext} />
              )}
              {currentStep === 'shipping' && (
                <ShippingStep method={shippingMethod} onSelect={setShippingMethod} onNext={handleNext} onPrev={handlePrev} />
              )}
              {currentStep === 'payment' && (
                <PaymentStep method={paymentMethod} onSelect={setPaymentMethod} onNext={handleNext} onPrev={handlePrev} />
              )}
              {currentStep === 'review' && (
                <ReviewStep
                  items={items}
                  address={shippingAddress}
                  shippingMethod={shippingMethod}
                  paymentMethod={paymentMethod}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  discount={discount}
                  total={total}
                  isProcessing={isProcessing}
                  onPlaceOrder={handlePlaceOrder}
                  onPrev={handlePrev}
                />
              )}
            </div>
          </div>

          {/* Right Column — Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-parchment rounded-xl p-6 lg:sticky lg:top-28 border border-silk">
              <h2 className="font-heading text-xl text-burgundy mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-18 rounded-md overflow-hidden bg-ivory shrink-0 relative">
                      <Image src={item.image} alt={item.title} width={56} height={72} className="w-full h-full object-cover" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-burgundy text-gold-pale text-[10px] font-medium flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-burgundy font-medium truncate">{item.title}</p>
                      <p className="text-xs text-rosewood mt-0.5">{item.color} / {item.size}</p>
                    </div>
                    <span className="font-mono text-sm text-burgundy shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dust pt-4 mb-4">
                <CouponInput subtotal={subtotal} appliedCoupon={appliedCoupon} onApply={handleCouponApply} onRemove={handleCouponRemove} />
              </div>

              <div className="border-t border-dust pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-wine">Subtotal</span>
                  <span className="font-mono text-burgundy">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success-moss">Discount</span>
                    <span className="font-mono text-success-moss">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-wine">Shipping</span>
                  <span className="font-mono text-burgundy">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>
                <div className="border-t border-dust pt-3 flex justify-between">
                  <span className="font-medium text-burgundy">Total</span>
                  <span className="font-mono text-xl text-burgundy font-medium">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
