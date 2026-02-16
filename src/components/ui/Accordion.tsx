'use client'

import { useState, useRef, useCallback } from 'react'

interface AccordionItem {
  title: string
  content: string | React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
}

export default function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  const toggle = useCallback((index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(allowMultiple ? prev : [])
      if (prev.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [allowMultiple])

  return (
    <div className="divide-y divide-gold/10">
      {items.map((item, i) => (
        <AccordionPanel
          key={i}
          item={item}
          isOpen={openIndices.has(i)}
          onToggle={() => toggle(i)}
          index={i}
        />
      ))}
    </div>
  )
}

function AccordionPanel({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const panelId = `accordion-panel-${index}`
  const headerId = `accordion-header-${index}`

  return (
    <div>
      <button
        id={headerId}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className={`font-heading text-lg transition-colors duration-300 ${isOpen ? 'text-gold' : 'text-burgundy group-hover:text-wine'}`}>
          {item.title}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold' : 'text-burgundy/40'}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 500}px` : '0px' }}
      >
        <div ref={contentRef} className="pb-5 text-sm text-wine/80 leading-relaxed">
          {item.content}
        </div>
      </div>
    </div>
  )
}
