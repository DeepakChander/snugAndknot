'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import TextReveal from '@/components/animation/TextReveal'

const FREE_SHIPPING_THRESHOLD = 150 // $150 USD

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const total = totalPrice()
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - total

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-10">
          Your Bag
        </TextReveal>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="mx-auto text-dust mb-6"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-xl text-burgundy font-heading mb-2">Your bag is empty</p>
            <p className="text-wine mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link
              href="/shop"
              className="inline-flex px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart items */}
            <div className="lg:col-span-2">
              {/* Free shipping progress bar */}
              <div className="mb-8 p-4 rounded-lg bg-parchment border border-silk">
                {amountToFreeShipping > 0 ? (
                  <p className="text-sm text-wine mb-2">
                    Add <span className="font-semibold text-burgundy">{formatPrice(amountToFreeShipping)}</span> more for free shipping
                  </p>
                ) : (
                  <p className="text-sm text-wine mb-2 font-semibold">
                    You qualify for free shipping!
                  </p>
                )}
                <div className="w-full h-2 bg-silk rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-600 ease-out bg-gold"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="border-b border-dust pb-4 mb-6 hidden sm:grid grid-cols-12 gap-4 text-xs text-rosewood uppercase tracking-widest">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-6 border-b border-dust"
                  >
                    {/* Product */}
                    <div className="sm:col-span-6 flex gap-4">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 bg-parchment rounded-md overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.title} width={96} height={112} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={`/product/${item.handle}`} className="text-sm font-medium text-burgundy hover:text-wine transition-colors">
                          {item.title}
                        </Link>
                        <p className="text-xs text-rosewood mt-1">{item.color} / {item.size}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-rosewood hover:text-blush-wine transition-colors underline mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-burgundy rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-wine hover:text-burgundy text-sm transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm text-burgundy font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-wine hover:text-burgundy text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-2 text-right">
                      <span className="font-mono text-sm text-burgundy">{formatPrice(item.price)}</span>
                    </div>

                    {/* Total */}
                    <div className="sm:col-span-2 text-right">
                      <span className="font-mono text-sm font-medium text-burgundy">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="text-xs text-rosewood hover:text-blush-wine transition-colors underline"
                >
                  Clear Bag
                </button>
                <Link href="/shop" className="text-sm text-burgundy hover:text-wine transition-colors flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-parchment rounded-lg p-6 lg:sticky lg:top-28 border border-silk">
                <h2 className="font-heading text-xl text-burgundy mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-wine">Subtotal</span>
                    <span className="font-mono text-burgundy">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-wine">Shipping</span>
                    <span className="text-rosewood">Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t border-dust pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-medium text-burgundy">Total</span>
                    <span className="font-mono text-xl text-burgundy">{formatPrice(total)}</span>
                  </div>
                </div>
                <button className="w-full py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors mb-3">
                  Proceed to Checkout
                </button>
                <p className="text-xs text-rosewood text-center">Taxes and shipping calculated at checkout</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
