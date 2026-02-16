// Analytics event tracking utility
// Development: console output with styled grouping
// Production: integrate with GTM / Mixpanel / Segment here

export const EVENTS = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  WISHLIST_ADD: 'wishlist_add',
  WISHLIST_REMOVE: 'wishlist_remove',
  SEARCH_QUERY: 'search_query',
  FILTER_APPLIED: 'filter_applied',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  COUPON_APPLIED: 'coupon_applied',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  CHAT_OPENED: 'chat_opened',
  SIZE_GUIDE_VIEWED: 'size_guide_viewed',
  AUTH_LOGIN: 'auth_login',
  AUTH_SIGNUP: 'auth_signup',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

export function trackEvent(
  name: string,
  properties?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(
      `%c[Analytics] %c${name}`,
      'color: #F1E194; font-weight: bold;',
      'color: #5B0E14; font-weight: bold;'
    )
    if (properties) {
      console.log('%cProperties:', 'color: #8B2E35;', properties)
    }
    console.log('%cTimestamp:', 'color: #BFA88E;', new Date().toISOString())
    console.groupEnd()
    return
  }

  // Production: send to GTM / Mixpanel / Segment
  // Example GTM integration:
  //   window.dataLayer?.push({ event: name, ...properties })
  //
  // Example Mixpanel integration:
  //   mixpanel.track(name, properties)
  //
  // Example Segment integration:
  //   analytics.track(name, properties)
}
