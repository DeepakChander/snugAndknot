'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-6xl text-charcoal mb-4">Oops!</h1>
        <p className="text-xl text-walnut mb-2">Something went wrong</p>
        <p className="text-earth mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex px-8 py-3.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
