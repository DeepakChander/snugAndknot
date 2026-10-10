'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div data-nav-theme="dark" className="flex min-h-[90svh] items-center bg-noir pt-nav text-bone">
      <div className="container-wide py-24">
        <p className="font-mono text-sm text-gold">Something went wrong</p>
        <h1 className="mt-4 max-w-[14ch] text-display">A thread came loose.</h1>
        <p className="mt-6 max-w-md text-bone/70">We could not load this page. Please try again — if it keeps happening, let us know.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn h-14 bg-ivory px-9 text-ink [--btn-fill:var(--color-gold)]">
            <span className="btn-fill" />
            Try again
          </button>
          <Link href="/" className="btn h-14 border border-ivory/30 px-9 text-ivory [--btn-fill:var(--color-ivory)] [--btn-ink-hover:var(--color-ink)]">
            <span className="btn-fill" />
            Back home
          </Link>
        </div>
        {error.digest ? <p className="mt-10 font-mono text-xs text-bone/40">Reference {error.digest}</p> : null}
      </div>
    </div>
  )
}
