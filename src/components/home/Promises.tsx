'use client'

import { useMoney, useSettings, useCurrency } from '@/components/providers/SettingsProvider'
import { NeedleIcon, ReturnIcon, ShieldIcon, TruckIcon } from '@/components/kit/icons'

/** Service promises in a quiet strip; every figure comes from the store settings, so they stay true. */
export default function Promises() {
  const { commerce } = useSettings()
  const money = useMoney()
  const { currency: cur } = useCurrency()
  const items = [
    {
      Icon: TruckIcon,
      title: cur.freeShippingThreshold > 0 ? `Free shipping over ${money(cur.freeShippingThreshold)}` : 'Shipping at cost',
      body: `Standard delivery ${money(cur.standardShippingRate)} below that, express ${money(cur.expressShippingRate)}.`,
      money: true,
    },
    { Icon: ReturnIcon, title: `${commerce.returnWindowDays}-day returns`, body: 'Start a return from your account once your order arrives.' },
    { Icon: NeedleIcon, title: 'Hand-finished', body: 'Buttons, seams and labels finished by hand in small batches.' },
    commerce.onlinePaymentsEnabled
      ? { Icon: ShieldIcon, title: 'Secure checkout', body: commerce.codEnabled ? 'Pay online through Razorpay, or pay when your parcel arrives.' : 'Pay online through Razorpay. Card details never reach this site.' }
      : commerce.codEnabled
        ? { Icon: ShieldIcon, title: 'Pay on delivery', body: 'Pay when your parcel arrives — no card details needed online.' }
        : { Icon: ShieldIcon, title: 'Track every order', body: 'Follow each order from your account, or with your order number and email.' },
  ]
  return (
    <section className="border-y border-ink/10 bg-bone text-ink" aria-label="Our promises">
      <ul className="container-wide grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {items.map(({ Icon, title, body, money: hasMoney }) => (
          <li key={title} className="flex gap-3.5 py-6 sm:pr-6 lg:py-8">
            <Icon size={22} className="mt-0.5 shrink-0 text-ink" />
            <div data-money={hasMoney ? '' : undefined}>
              <p className="text-[0.92rem] font-medium">{title}</p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-stone">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
