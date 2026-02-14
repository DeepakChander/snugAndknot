'use client'

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-charcoal focus:text-cream focus:rounded-full focus:text-sm focus:font-medium"
    >
      Skip to main content
    </a>
  )
}
