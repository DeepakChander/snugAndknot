import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface ReviewItem {
  id: string
  title: string
  image: string
  color: string
  size: string
  price: number
  quantity: number
}

export default function ReviewStep({
  items,
  address,
  shippingMethod,
  paymentMethod,
  subtotal,
  shippingCost,
  discount,
  total,
  isProcessing,
  onPlaceOrder,
  onPrev,
}: {
  items: ReviewItem[]
  address: Record<string, unknown>
  shippingMethod: 'standard' | 'express'
  paymentMethod: 'card' | 'paypal'
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  isProcessing: boolean
  onPlaceOrder: () => void
  onPrev: () => void
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl sm:text-3xl text-burgundy mb-2">
        Review Your Order
      </h2>
      <p className="text-sm text-wine mb-8">
        Please verify your details before placing the order.
      </p>

      {/* Shipping Address */}
      <div className="mb-6 p-5 rounded-xl bg-parchment border border-silk">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider">
            Shipping Address
          </h3>
        </div>
        <p className="text-sm text-wine leading-relaxed">
          {address.name ? String(address.name) : ''}
          <br />
          {address.street ? String(address.street) : ''}
          <br />
          {address.city ? String(address.city) : ''}
          {address.state ? `, ${String(address.state)}` : ''} {address.zip ? String(address.zip) : ''}
          <br />
          {address.country ? String(address.country) : ''}
        </p>
        {address.phone ? (
          <p className="text-xs text-rosewood mt-1">{String(address.phone)}</p>
        ) : null}
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-xl bg-parchment border border-silk">
          <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-2">
            Shipping
          </h3>
          <p className="text-sm text-wine">
            {shippingMethod === 'standard'
              ? 'Standard (3-5 days) — Free'
              : 'Express (1-2 days) — $12.00'}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-parchment border border-silk">
          <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-2">
            Payment
          </h3>
          <p className="text-sm text-wine">
            {paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-4">
          Items ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl bg-parchment border border-silk"
            >
              <div className="w-16 h-20 rounded-md overflow-hidden bg-ivory shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={64}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-burgundy truncate">
                  {item.title}
                </p>
                <p className="text-xs text-rosewood mt-0.5">
                  {item.color} / {item.size} / Qty: {item.quantity}
                </p>
              </div>
              <span className="font-mono text-sm text-burgundy shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="p-5 rounded-xl bg-parchment border border-silk mb-8 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-wine">Subtotal</span>
          <span className="font-mono text-burgundy">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success-moss">Discount</span>
            <span className="font-mono text-success-moss">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-wine">Shipping</span>
          <span className="font-mono text-burgundy">
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="border-t border-dust pt-2.5 flex justify-between">
          <span className="font-medium text-burgundy text-lg">Total</span>
          <span className="font-mono text-xl text-burgundy font-semibold">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
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
          onClick={onPlaceOrder}
          disabled={isProcessing}
          className="relative px-10 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
              </svg>
              Processing...
            </span>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  )
}
