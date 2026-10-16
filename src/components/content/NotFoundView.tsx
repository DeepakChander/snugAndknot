import Image from 'next/image'
import Link from 'next/link'
import Wordmark from '@/components/chrome/Wordmark'
import { ButtonLink } from '@/components/kit/Button'

/** Shared by app/not-found (outside the store chrome) and in-store 404s. */
export default function NotFoundView({ standalone = false }: { standalone?: boolean }) {
  return (
    <div className="bg-ivory pt-nav text-ink">
      <div className="container-wide grid min-h-[70svh] items-center gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          {standalone ? (
            <Link href="/" className="mb-12 inline-block">
              <Wordmark className="text-2xl" />
            </Link>
          ) : null}
          <p className="text-eyebrow text-stone">Error 404</p>
          <h1 className="mt-4 max-w-[14ch] text-display">
            We dropped a <em>stitch</em>.
          </h1>
          <p className="mt-5 max-w-md text-lead text-stone">This page may have moved or never existed. Let us find you something to wear instead.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop">Shop everything</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back home
            </ButtonLink>
          </div>
        </div>
        <div className="relative hidden aspect-[4/5] overflow-hidden bg-parchment lg:block">
          <Image src="/images/Collections-Hero/Coastal.png" alt="" fill priority sizes="40vw" className="object-cover" />
        </div>
      </div>
    </div>
  )
}
