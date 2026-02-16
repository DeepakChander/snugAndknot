'use client'

import { useRef, useCallback, useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------
   Link data
   ------------------------------------------------ */
const genderLinks = [
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/women', label: 'Women' },
  { href: '/shop/kids', label: 'Kids' },
]

const categoryLinks = [
  { href: '/shop?category=tops', label: 'Tops' },
  { href: '/shop?category=bottoms', label: 'Bottoms' },
  { href: '/shop?category=dresses', label: 'Dresses' },
  { href: '/shop?category=outerwear', label: 'Outerwear' },
  { href: '/shop?category=accessories', label: 'Accessories' },
]

/* ------------------------------------------------
   Props
   ------------------------------------------------ */
interface MegaMenuPanelProps {
  isOpen: boolean
  onLinkClick?: () => void
}

/* ------------------------------------------------
   NavLink with gold thread underline on hover
   ------------------------------------------------ */
function NavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative inline-block py-1.5 text-sm text-burgundy/80 hover:text-burgundy transition-colors duration-200"
      role="menuitem"
    >
      {label}
      {/* Gold thread underline: width 0 -> 100% from left */}
      <span className="absolute left-0 -bottom-0.5 w-full h-[1.5px] bg-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
    </Link>
  )
}

/* ------------------------------------------------
   Component
   ------------------------------------------------ */
export default function MegaMenuPanel({ isOpen, onLinkClick }: MegaMenuPanelProps) {
  const featuredRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  /* ---- Parallax tilt on featured image ---- */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!featuredRef.current) return
    const rect = featuredRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setTilt({ x: y * -6, y: x * 6 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
  }, [])

  return (
    <div className="grid grid-cols-3 gap-8 p-8">
      {/* ---- Column 1: Shop by Gender ---- */}
      <div
        className="transition-all duration-500 ease-[var(--ease-loom-settle)]"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: isOpen ? '100ms' : '0ms',
        }}
      >
        <h3 className="text-xs uppercase tracking-widest text-burgundy/40 font-semibold mb-4">
          Shop by Gender
        </h3>
        <nav className="flex flex-col gap-1" role="menu">
          {genderLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={onLinkClick}
            />
          ))}
        </nav>
      </div>

      {/* ---- Column 2: Shop by Category ---- */}
      <div
        className="transition-all duration-500 ease-[var(--ease-loom-settle)]"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: isOpen ? '200ms' : '0ms',
        }}
      >
        <h3 className="text-xs uppercase tracking-widest text-burgundy/40 font-semibold mb-4">
          Shop by Category
        </h3>
        <nav className="flex flex-col gap-1" role="menu">
          {categoryLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={onLinkClick}
            />
          ))}
        </nav>
      </div>

      {/* ---- Column 3: Featured Image ---- */}
      <div
        className="transition-all duration-500 ease-[var(--ease-loom-settle)]"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: isOpen ? '300ms' : '0ms',
        }}
      >
        <div
          ref={featuredRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-xl overflow-hidden aspect-[4/3] bg-burgundy/5 cursor-pointer group"
          style={{ perspective: '600px' }}
          onClick={onLinkClick}
        >
          <Link href="/collections/winter-warmth" className="block w-full h-full">
            <div
              className="w-full h-full transition-transform duration-300 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`,
              }}
            >
              <img
                src="/images/collections/winter-warmth.jpg"
                alt="Season's Edit - curated winter collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[var(--ease-loom-settle)]"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/20 to-transparent" />
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs uppercase tracking-widest text-gold/80 mb-1">
                  Curated
                </p>
                <p className="font-heading text-xl text-ivory">
                  Season&apos;s Edit
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
