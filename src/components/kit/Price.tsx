'use client'

import { useMoney } from '@/components/providers/SettingsProvider'
import { discountPercent, cn } from '@/lib/format'

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
    <span className={cn('inline-flex items-baseline gap-2 font-mono tabular-nums', className)}>
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
