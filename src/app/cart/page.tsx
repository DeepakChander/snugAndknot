'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import TextReveal from '@/components/animation/TextReveal'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-10">
          Your Bag
        </TextReveal>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-sand mb-6">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-xl text-charcoal font-heading mb-2">Your bag is empty</p>
            <p className="text-walnut mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link
              href="/shop"
              className="inline-flex px-8 py-3.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="border-b border-beige pb-4 mb-6 hidden sm:grid grid-cols-12 gap-4 text-xs text-earth uppercase tracking-widest">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-6 border-b border-beige"
                  >
                    {/* Product */}
                    <div className="sm:col-span-6 flex gap-4">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 bg-cream-dark rounded-md overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.title} width={96} height={112} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={`/product/${item.handle}`} className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors">
                          {item.title}
                        </Link>
                        <p className="text-xs text-earth mt-1">{item.color} / {item.size}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-earth hover:text-terracotta transition-colors underline mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-beige rounded-full">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-walnut hover:text-charcoal text-sm">-</button>
                        <span className="w-8 text-center text-sm text-charcoal">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-walnut hover:text-charcoal text-sm">+</button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-2 text-right">
                      <span className="font-mono text-sm text-charcoal">{formatPrice(item.price)}</span>
                    </div>

                    {/* Total */}
                    <div className="sm:col-span-2 text-right">
                      <span className="font-mono text-sm font-medium text-charcoal">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="text-xs text-earth hover:text-terracotta transition-colors underline"
                >
                  Clear Bag
                </button>
                <Link href="/shop" className="text-sm text-charcoal hover:text-terracotta transition-colors flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-cream-dark rounded-lg p-6 lg:sticky lg:top-28">
                <h2 className="font-heading text-xl text-charcoal mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-walnut">Subtotal</span>
                    <span className="font-mono text-charcoal">{formatPrice(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-walnut">Shipping</span>
                    <span className="text-earth">Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t border-beige pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-medium text-charcoal">Total</span>
                    <span className="font-mono text-xl text-charcoal">{formatPrice(totalPrice())}</span>
                  </div>
                </div>
                <button className="w-full py-3.5 bg-terracotta text-cream text-sm font-medium rounded-full hover:bg-terracotta-dark transition-colors mb-3">
                  Proceed to Checkout
                </button>
                <p className="text-xs text-earth text-center">Taxes and shipping calculated at checkout</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
