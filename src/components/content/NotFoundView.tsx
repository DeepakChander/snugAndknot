'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import Wordmark from '@/components/chrome/Wordmark'

const EASE = [0.16, 1, 0.3, 1] as const

/** Shared by app/not-found (outside the store chrome) and in-store 404s. */
export default function NotFoundView({ standalone = false }: { standalone?: boolean }) {
  return (
    <div data-nav-theme="dark" className="relative flex min-h-[100svh] items-center overflow-hidden bg-noir text-bone">
      <motion.div initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 0.35, scale: 1 }} transition={{ duration: 2, ease: EASE }} className="absolute inset-0">
        <Image src="/images/lookbook/after-dark-2.png" alt="" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/80 to-noir/30" />
      <div className="container-wide relative py-28">
        {standalone ? (
          <Link href="/" className="mb-16 inline-block">
            <Wordmark className="text-3xl" />
          </Link>
        ) : null}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }} className="font-mono text-sm text-gold">
          404
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.1 }} className="mt-4 max-w-[12ch] text-mega">
          We dropped a stitch.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }} className="mt-8 max-w-md text-lead text-bone/70">
          This page has come unravelled — it may have moved or never existed. Let us find you something worth wearing instead.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.45 }} className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop" className="btn h-14 bg-ivory px-9 text-ink [--btn-fill:var(--color-gold)]">
            <span className="btn-fill" />
            Shop the collection
          </Link>
          <Link href="/" className="btn h-14 border border-ivory/30 px-9 text-ivory [--btn-fill:var(--color-ivory)] [--btn-ink-hover:var(--color-ink)]">
            <span className="btn-fill" />
            Back home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
