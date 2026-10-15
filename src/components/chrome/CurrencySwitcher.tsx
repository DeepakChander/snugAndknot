'use client'

import { useCurrency } from '@/components/providers/SettingsProvider'
import { useHydrated } from '@/hooks/use-hydrated'
import { cn } from '@/lib/format'
import { currencySymbol } from '@/lib/currency'


/** Lets the shopper pick a currency. Renders nothing while the shop sells in one currency only. */
export default function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, all, setCurrency } = useCurrency()
  const hydrated = useHydrated()
  if (all.length < 2 || !hydrated) return null
  return (
    <label className={cn('inline-flex items-center gap-2', className)}>
      <span className="sr-only">Currency</span>
      <select
        value={currency.code}
        onChange={(e) => setCurrency(e.target.value)}
        className="cursor-pointer rounded-full border border-current/25 bg-transparent px-3 py-1.5 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {all.map((c) => (
          <option key={c.code} value={c.code} className="text-ink">
            {currencySymbol(c.code, c.locale)} {c.code}
          </option>
        ))}
      </select>
    </label>
  )
}
