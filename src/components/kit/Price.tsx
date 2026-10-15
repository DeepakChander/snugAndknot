'use client'

import { useCurrency, useMoney, useProductPrice } from '@/components/providers/SettingsProvider'
import { discountPercent, cn } from '@/lib/format'
import type { PriceBook } from '@/types/commerce'

/** An amount already in the shopper's currency. */
export default function Price({
  price,
  compareAt,
  className,
  showSaving = false,
}: {
  price: number
  compareAt?: number | null
  className?: string
  showSaving?: boolean
}) {
  const money = useMoney()
  const pct = discountPercent(price, compareAt)
  return (
    <span data-money className={cn('inline-flex items-baseline gap-2 font-mono tabular-nums', className)}>
      <span>{money(price)}</span>
      {pct > 0 && compareAt ? (
        <>
          <s className="opacity-45">
            <span className="sr-only">Was </span>
            {money(compareAt)}
          </s>
          {showSaving ? <span className="text-label text-burgundy">−{pct}%</span> : null}
        </>
      ) : null}
    </span>
  )
}

type Priced = { price: number; compareAtPrice: number | null; prices?: PriceBook }

/** A product's price in the shopper's currency, or a note when it has none in it yet. */
export function ProductPrice({ product, className, showCompareAt = true }: { product: Priced; className?: string; showCompareAt?: boolean }) {
  const priceOf = useProductPrice()
  const { currency } = useCurrency()
  const p = priceOf(product)
  if (!p) {
    return (
      <span data-money className={cn('font-mono text-[0.7rem] opacity-60', className)}>
        Not in {currency.code} yet
      </span>
    )
  }
  return <Price price={p.price} compareAt={showCompareAt ? p.compareAtPrice : null} className={className} />
}
