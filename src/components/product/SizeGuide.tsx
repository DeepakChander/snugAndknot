'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'
import sizeGuideData from '@/data/size-guide.json'
import type { SizeGuideEntry } from '@/types'

type SizeTab = 'tops' | 'bottoms'

interface SizeGuideProps {
  isOpen: boolean
  onClose: () => void
  category?: string
}

const data: Record<SizeTab, SizeGuideEntry[]> = sizeGuideData as Record<SizeTab, SizeGuideEntry[]>

export default function SizeGuide({ isOpen, onClose, category }: SizeGuideProps) {
  const initialTab: SizeTab = category === 'bottoms' ? 'bottoms' : 'tops'
  const [activeTab, setActiveTab] = useState<SizeTab>(initialTab)
  const [activeSize, setActiveSize] = useState<string | null>(null)

  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const entries = data[activeTab] || []
  const allSizes = entries.map((e) => e.size)

  // Entrance animation
  useEffect(() => {
    if (!panelRef.current || !backdropRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      useUIStore.getState().lenisStop?.()
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'expo.out', delay: 0.05 }
      )
    } else {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }

    return () => {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset active size when tab changes
  useEffect(() => {
    setActiveSize(null)
  }, [activeTab])

  // Scroll to row when quick-jumping to a size
  useEffect(() => {
    if (!activeSize || !tableRef.current) return
    const row = tableRef.current.querySelector(`[data-size="${activeSize}"]`)
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeSize])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/* Modal Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Size Guide"
        className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto bg-ivory rounded-sm shadow-2xl"
        style={{ opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-parchment/80 text-burgundy hover:bg-gold-pale transition-colors"
          aria-label="Close size guide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <h2 className="font-heading text-2xl text-burgundy mb-1">Size Guide</h2>
          <p className="text-sm text-dust mb-6">Find your perfect fit</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b border-silk">
            {(['tops', 'bottoms'] as SizeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-burgundy border-burgundy'
                    : 'text-dust border-transparent hover:text-wine hover:border-gold-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Quick Jump Sizes */}
          <div className="flex flex-wrap gap-2 mb-5">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => setActiveSize(size)}
                className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-full border transition-all duration-200 ${
                  activeSize === size
                    ? 'bg-burgundy text-gold-pale border-burgundy'
                    : 'bg-transparent text-burgundy border-silk hover:border-gold'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Size Table */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
            <table ref={tableRef} className="w-full text-sm">
              <thead>
                <tr className="border-b border-burgundy/20">
                  <th className="py-3 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                    Size
                  </th>
                  <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                    Chest
                  </th>
                  <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                    Waist
                  </th>
                  <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                    Hips
                  </th>
                  <th className="py-3 pl-4 text-left text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.size}
                    data-size={entry.size}
                    className={`border-b border-silk/50 transition-colors duration-200 cursor-pointer ${
                      activeSize === entry.size
                        ? 'bg-gold-pale/50'
                        : 'hover:bg-gold-pale/30'
                    }`}
                    onClick={() => setActiveSize(entry.size)}
                  >
                    <td className="py-3 pr-4 font-medium text-burgundy">{entry.size}</td>
                    <td className="py-3 px-4 text-wine">{entry.chest}</td>
                    <td className="py-3 px-4 text-wine">{entry.waist}</td>
                    <td className="py-3 px-4 text-wine">{entry.hips}</td>
                    <td className="py-3 pl-4 text-wine">{entry.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure */}
          <div className="mt-8 p-5 bg-parchment/60 rounded-sm">
            <h3 className="font-heading text-lg text-burgundy mb-3">How to Measure</h3>
            <ul className="space-y-2.5 text-sm text-wine leading-relaxed">
              <li className="flex gap-2">
                <span className="text-gold font-semibold shrink-0">Chest:</span>
                Measure around the fullest part of your chest, keeping the tape level under your arms.
              </li>
              <li className="flex gap-2">
                <span className="text-gold font-semibold shrink-0">Waist:</span>
                Measure around your natural waistline, the narrowest part of your torso.
              </li>
              <li className="flex gap-2">
                <span className="text-gold font-semibold shrink-0">Hips:</span>
                Measure around the widest part of your hips, approximately 8 inches below your waist.
              </li>
              <li className="flex gap-2">
                <span className="text-gold font-semibold shrink-0">Length:</span>
                For tops, measure from the highest point of the shoulder to the hem. For bottoms, measure the inseam from crotch to ankle.
              </li>
            </ul>
            <p className="mt-4 text-xs text-dust">
              Tip: If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a more tailored look.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
