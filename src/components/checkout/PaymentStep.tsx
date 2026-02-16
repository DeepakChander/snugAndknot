'use client'

import { useState } from 'react'
import FloatingInput from './FloatingInput'

const formatCardNumber = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2)
  }
  return digits
}

export default function PaymentStep({
  method,
  onSelect,
  onNext,
  onPrev,
}: {
  method: 'card' | 'paypal'
  onSelect: (m: 'card' | 'paypal') => void
  onNext: () => void
  onPrev: () => void
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [nameOnCard, setNameOnCard] = useState('')

  return (
    <div>
      <h2 className="font-heading text-2xl sm:text-3xl text-burgundy mb-2">
        Payment Method
      </h2>
      <p className="text-sm text-wine mb-8">
        All transactions are secure and encrypted.
      </p>

      {/* Payment Method Toggle */}
      <div className="flex gap-2 mb-8 p-1 bg-parchment rounded-full border border-silk w-fit">
        <button
          type="button"
          onClick={() => onSelect('card')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            method === 'card'
              ? 'bg-burgundy text-gold-pale shadow-sm'
              : 'text-wine hover:text-burgundy'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Card
        </button>
        <button
          type="button"
          onClick={() => onSelect('paypal')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            method === 'paypal'
              ? 'bg-burgundy text-gold-pale shadow-sm'
              : 'text-wine hover:text-burgundy'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 11l-1 8h4l1-4h2c3 0 5-2 5.5-5S17 5 14 5H8l-1 6z" />
          </svg>
          PayPal
        </button>
      </div>

      {method === 'card' ? (
        <div className="space-y-5">
          <FloatingInput
            name="nameOnCard"
            label="Name on Card"
            type="text"
            value={nameOnCard}
            onChange={setNameOnCard}
          />
          <FloatingInput
            name="cardNumber"
            label="Card Number"
            type="text"
            value={cardNumber}
            onChange={(val) => setCardNumber(formatCardNumber(val))}
          />
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              name="expiry"
              label="MM/YY"
              type="text"
              value={expiry}
              onChange={(val) => setExpiry(formatExpiry(val))}
            />
            <FloatingInput
              name="cvc"
              label="CVC"
              type="text"
              value={cvc}
              onChange={(val) => setCvc(val.replace(/\D/g, '').slice(0, 4))}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-rosewood mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Your payment information is secure and encrypted
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-parchment border border-silk text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#003087]/10 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="1.5">
              <path d="M7 11l-1 8h4l1-4h2c3 0 5-2 5.5-5S17 5 14 5H8l-1 6z" />
            </svg>
          </div>
          <p className="text-sm text-burgundy font-medium mb-1">PayPal Checkout</p>
          <p className="text-xs text-rosewood">
            You&apos;ll be redirected to PayPal to complete your purchase.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 text-sm text-wine hover:text-burgundy transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  )
}
