import { formatMoney } from './format'
import { deliveryText, refundText, returnShippingText } from '@/lib/policy'
import type { SiteSettings } from '@/types/commerce'

export interface FaqGroup {
  name: string
  items: { q: string; a: string }[]
}

/** Answers are built from the live settings so they never contradict checkout. */
export function faqGroups({ commerce, store, reviews }: Pick<SiteSettings, 'commerce' | 'store' | 'reviews'>): FaqGroup[] {
  const m = (n: number) => formatMoney(n, commerce.currency, commerce.locale)
  return [
    {
      name: 'Ordering',
      items: [
        { q: 'How do I place an order?', a: 'Choose your size on a product page, add it to your bag and go to checkout. You can check out as a guest or sign in to earn points and see your orders in one place.' },
        {
          q: 'How do I pay?',
          a: commerce.onlinePaymentsEnabled
            ? commerce.codEnabled
              ? 'Pay online at checkout, by card or the other methods shown there, through Razorpay. Or choose pay on delivery and pay the courier when your parcel arrives. Card details go straight to Razorpay and never reach this website.'
              : 'Pay online at checkout, by card or the other methods shown there, through Razorpay. Card details go straight to Razorpay and never reach this website.'
            : commerce.codEnabled
              ? 'Orders are paid on delivery — you pay the courier when your parcel arrives. Online card payments are coming soon.'
              : 'Available payment options are shown at checkout.',
        },
        { q: 'Can I change or cancel my order?', a: `Contact us at ${store.email} as soon as possible with your order number. If your order has not shipped yet we will do our best to change or cancel it.` },
        { q: 'Do you have discount codes?', a: 'Codes are entered in your bag or at checkout. Each code shows its conditions — like a minimum spend or an expiry date — if it cannot be applied.' },
      ],
    },
    {
      name: 'Shipping',
      items: [
        {
          q: 'How much is shipping?',
          a:
            commerce.freeShippingThreshold > 0
              ? `Standard shipping is free on orders over ${m(commerce.freeShippingThreshold)} (after discounts) and ${m(commerce.standardShippingRate)} below that. Express shipping is ${m(commerce.expressShippingRate)}.`
              : `Standard shipping is ${m(commerce.standardShippingRate)} and express shipping is ${m(commerce.expressShippingRate)}.`,
        },
        { q: 'How can I track my order?', a: 'Signed-in customers can follow every order from their account. Guests can use the Track an order page with their order number and email. Tracking numbers appear there once your parcel ships.' },
        ...(commerce.deliveryEstimate?.trim() ? [{ q: 'How long does delivery take?', a: deliveryText(commerce) }] : []),
        { q: 'Where do you ship?', a: `Ask us at ${store.email} before ordering if you are unsure whether we deliver to your address.` },
      ],
    },
    {
      name: 'Pieces & sizing',
      items: [
        { q: 'What are your clothes made from?', a: 'Each product page lists the exact fabric, along with fit and care notes.' },
        { q: 'How do I find my size?', a: 'Every product page has a size guide with body measurements, and reviews show whether customers found a piece small, true to size or large.' },
        { q: 'How do I care for my clothes?', a: 'Follow the care label on each piece. Our care guide covers washing, drying and storing in detail.' },
        { q: 'A size is sold out — will it come back?', a: 'Leave your email on the product page and we will let you know when it is back.' },
      ],
    },
    {
      name: 'Returns',
      items: [
        { q: 'What is your return policy?', a: `You can return unworn pieces in their original condition within ${commerce.returnWindowDays} days of delivery.` },
        { q: 'How do I start a return?', a: 'Sign in, open the order and choose Start a return, then pick the pieces and the reason. Checked out as a guest? Email us with your order number.' },
        { q: 'When will I get my refund?', a: refundText(commerce) },
        { q: 'Who pays for return shipping?', a: returnShippingText(commerce) },
      ],
    },
    {
      name: 'Account & reviews',
      items: [
        { q: 'Do I need an account?', a: 'No — guests can order and track orders. An account keeps your orders, returns, wishlist and loyalty points together.' },
        { q: 'How do loyalty points work?', a: `You earn ${commerce.pointsPerDollar} point${commerce.pointsPerDollar === 1 ? '' : 's'} per unit of currency spent while signed in, plus 100 points when you join. Points from a cancelled order are removed.` },
        { q: 'I forgot my password.', a: `Email ${store.email} from the address on your account and we will reset it for you.` },
        { q: 'How do reviews work?', a: reviews.moderation === 'manual' ? 'Signed-in customers can review any piece. Reviews are checked by our team before they appear, and reviews from customers who bought the piece carry a verified badge.' : 'Signed-in customers can review any piece, and reviews from customers who bought it carry a verified badge.' },
      ],
    },
  ]
}
