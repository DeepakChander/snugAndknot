'use client'

import { useEffect } from 'react'
import MegaMenuPanel from '@/components/layout/MegaMenuPanel'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <div
      role="menu"
      aria-label="Shop categories"
      className="hidden lg:block absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-[var(--ease-loom-settle)]"
      style={{
        maxHeight: isOpen ? '600px' : '0px',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-10 pt-2 pb-0">
        <div className="rounded-2xl border border-gold/10 shadow-2xl shadow-noir/40 overflow-hidden" style={{ background: 'rgba(15, 10, 11, 0.97)', backdropFilter: 'blur(24px)' }}>
          <MegaMenuPanel isOpen={isOpen} onLinkClick={onClose} />

          {/* Bottom decorative gold line */}
          <div className="relative h-[2px] bg-gold/5">
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-700 ease-[var(--ease-loom-settle)]"
              style={{ width: isOpen ? '80%' : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
