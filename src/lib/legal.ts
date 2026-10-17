import type { SiteSettings } from '@/types/commerce'
import { deliveryText, refundText, returnShippingText } from '@/lib/policy'

export interface LegalSection {
  id: string
  title: string
  body: string[]
}


/**
 * Privacy policy. Based on the store's existing policy, corrected to match what the site
 * actually does (pay on delivery, Google Analytics and the Meta Pixel). The store owner
 * should have it reviewed for their jurisdiction.
 */
export function privacySections({ store, commerce }: Pick<SiteSettings, 'store' | 'commerce'>): LegalSection[] {
  return [
    {
      id: 'information-collected',
      title: 'Information we collect',
      body: [
        'We collect the information you give us: your name, email address, delivery address and phone number when you place an order, create an account, join our newsletter, request a back-in-stock alert or contact us.',
        'When you visit the site we also collect technical information such as your IP address, browser and device type, the pages you view and the page that referred you.',
      ],
    },
    {
      id: 'how-used',
      title: 'How we use it',
      body: [
        'To process and deliver your orders, manage returns, run your account and loyalty points, answer your messages, send the newsletter you asked for, keep the site secure and improve it.',
        'We do not sell your personal information.',
      ],
    },
    {
      id: 'sharing',
      title: 'Who we share it with',
      body: [
        'Only with the providers that help us run the shop — for example our hosting and database providers and the carriers that deliver your parcel — and where the law requires it. They may only use it to provide their service to us.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and tracking',
      body: [
        'Essential cookies and browser storage keep you signed in and remember your bag, wishlist and recently viewed pieces.',
        'We use Google Analytics to understand how the site is used, and the Meta Pixel to measure visits from and the performance of our advertising on Meta platforms. You can block or delete cookies in your browser settings; the shop will still work, but you may need to sign in again.',
      ],
    },
    {
      id: 'payments',
      title: 'Payments',
      body: commerce.onlinePaymentsEnabled
        ? [
            'Online payments are processed by Razorpay. You enter your card or bank details in Razorpay\'s secure payment window; they are never sent to or stored on this website. We receive only the payment reference, amount and status, and share your name, email and phone with Razorpay to process the payment.',
            ...(commerce.codEnabled ? ['You can also choose to pay on delivery.'] : []),
          ]
        : ['Orders are currently paid on delivery. We do not collect or store card details on this website.'],
    },
    {
      id: 'security',
      title: 'Security',
      body: [
        'The site is served over HTTPS, passwords are stored only as salted hashes, and access to customer data is limited to the people who need it to run the shop. No method of transmission or storage is completely secure, but we work to protect your information.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      body: [
        `Depending on where you live you may have the right to access, correct or delete the personal data we hold about you, to object to its use, and to unsubscribe from marketing at any time. To make a request, email ${store.email}.`,
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep it',
      body: ['We keep order records for as long as we need them for accounting and legal purposes, and other data for as long as your account or subscription is active. You can ask us to delete your account at any time.'],
    },
    {
      id: 'children',
      title: 'Children',
      body: ['The shop is not directed at children under 16 and we do not knowingly collect their personal information.'],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: ['We may update this policy from time to time. The latest version will always be on this page.'],
    },
    {
      id: 'contact',
      title: 'Contact',
      body: [store.name, `Email ${store.email}${store.phone ? ` · Phone ${store.phone}` : ''}`],
    },
  ]
}

/** Terms of service, from the store's existing terms with payment terms corrected. */
export function termsSections({ store, commerce }: Pick<SiteSettings, 'store' | 'commerce'>): LegalSection[] {
  return [
    { id: 'acceptance', title: 'Acceptance of terms', body: [`By using the ${store.name} website and buying our products you agree to these terms. If you do not agree, please do not use the site. We may update these terms; the version on this page applies.`] },
    { id: 'eligibility', title: 'Eligibility', body: ['You must be at least 18 to place an order, or have the permission of a parent or guardian.'] },
    {
      id: 'accounts',
      title: 'Accounts',
      body: ['You are responsible for keeping your password confidential and for activity on your account. Please give accurate details and keep them up to date. We may suspend accounts used for fraud or that break these terms. You can ask us to close your account at any time.'],
    },
    {
      id: 'purchases',
      title: 'Orders, prices and payment',
      body: [
        `Prices are shown in ${commerce.currency} and may change. We may refuse or cancel an order — for example because of a pricing error, suspected fraud or limited stock — and will let you know if we do.`,
        commerce.onlinePaymentsEnabled
          ? `Online payments are taken through Razorpay when you place the order; your order is confirmed once the payment is.${commerce.codEnabled ? ' You can also choose to pay in cash on delivery, at no extra charge.' : ''}`
          : commerce.codEnabled
            ? 'Orders are currently paid in cash on delivery, at no extra charge.'
            : 'Payment options are shown at checkout.',
        commerce.taxRate > 0 ? `Tax is charged at ${commerce.taxRate}% where applicable.` : 'Any applicable taxes are shown at checkout.',
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping and returns',
      body: [
        `Our shipping and returns policy is part of these terms. ${deliveryText(commerce)} Returns are accepted within ${commerce.returnWindowDays} days of delivery.`.replace(/\s+/g, ' '),
        `${refundText(commerce)} ${returnShippingText(commerce)}`,
        'We are not responsible for delays caused by carriers, customs or events outside our control.',
      ],
    },
    { id: 'ip', title: 'Intellectual property', body: [`Everything on this site — text, photography, designs, logos and software — belongs to ${store.name} or its licensors. Please do not copy or reuse it without our written permission.`] },
    { id: 'prohibited', title: 'Acceptable use', body: ['Do not use the site to break the law, impersonate anyone, upload harmful code, scrape it without permission or interfere with how it works.'] },
    { id: 'liability', title: 'Limitation of liability', body: [`To the extent the law allows, ${store.name} is not liable for indirect or consequential losses, and our total liability for a claim is limited to the amount you paid for the product concerned. Nothing in these terms limits rights you have under consumer law.`] },
    { id: 'law', title: 'Governing law', body: [`These terms are governed by the laws applicable where ${store.name} is based.`] },
    { id: 'contact', title: 'Contact', body: [store.name, `Email ${store.email}${store.phone ? ` · Phone ${store.phone}` : ''}`] },
  ]
}
