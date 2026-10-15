'use client'

import { useMoney, useSettings, useCurrency } from '@/components/providers/SettingsProvider'
import { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { NeedleIcon, ReturnIcon, ShieldIcon, TruckIcon } from '@/components/kit/icons'

/** Service promises — every figure comes from the store settings, so they stay true. */
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
    <section className="border-t border-ink/10 bg-ivory text-ink" aria-label="Our promises">
      <RevealGroup className="container-wide grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {items.map(({ Icon, title, body, money: hasMoney }) => (
          <RevealItem key={title} className="flex gap-4 py-8 sm:px-6 lg:py-12 lg:first:pl-0">
            <Icon size={26} className="shrink-0 text-burgundy" />
            <div data-money={hasMoney ? '' : undefined}>
              <p className="font-display text-2xl leading-tight">{title}</p>
              <p className="mt-2 text-sm text-stone">{body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
