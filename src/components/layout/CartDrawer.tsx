'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import { slideInRight } from '@/lib/animations'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-espresso/40 z-50"
          />

          {/* Drawer */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-cream z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
              <h2 className="font-heading text-xl text-charcoal">Your Bag ({items.length})</h2>
              <button
                onClick={closeCart}
                className="p-2 text-walnut hover:text-charcoal transition-colors"
                aria-label="Close cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-sand mb-4">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p className="text-walnut mb-1">Your bag is empty</p>
                  <p className="text-sm text-earth mb-6">Discover something you love</p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 pb-4 border-b border-beige"
                    >
                      <div className="w-20 h-24 bg-cream-dark rounded-md overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-charcoal truncate">{item.title}</h3>
                        <p className="text-xs text-earth mt-0.5">
                          {item.color} / {item.size}
                        </p>
                        <p className="text-sm font-mono text-charcoal mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border border-beige rounded text-xs text-walnut hover:border-charcoal transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm text-charcoal w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-beige rounded text-xs text-walnut hover:border-charcoal transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-xs text-earth hover:text-terracotta transition-colors underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-beige space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-walnut">Subtotal</span>
                  <span className="font-mono text-lg text-charcoal">{formatPrice(totalPrice())}</span>
                </div>
                <p className="text-xs text-earth">Shipping calculated at checkout</p>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full py-3 bg-charcoal text-cream text-sm font-medium text-center rounded-full hover:bg-espresso transition-colors"
                >
                  View Bag
                </Link>
                <button className="w-full py-3 bg-terracotta text-cream text-sm font-medium rounded-full hover:bg-terracotta-dark transition-colors">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
