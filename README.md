# Snug&Knot

The storefront and admin for Snug&Knot, a small knitwear label. Next.js 16 (App Router)
with a PostgreSQL backend, a WebGL product gallery, and an admin panel at `/admin` where
every product, order, review and store setting can be edited.

## Run it locally

```bash
npm ci
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

With no `DATABASE_URL`, the site uses a built-in PGlite database saved under `.data/`
(development only). The schema is created and the catalogue seeded on first start.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next.js rules plus security rules) |
| `node scripts/api-smoke.mjs` | End-to-end API and security test. Needs `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; writes test rows, so never point it at production |
| `node scripts/currency-smoke.mjs` | End-to-end test of a second currency (INR): settings, prices, quotes, coupons, orders, returns and reports. Needs `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; writes test rows |
| `node scripts/razorpay-smoke.mjs` | End-to-end test of online payments against a local stand-in for the Razorpay API (see [Online payments](#online-payments-razorpay)). Local only |

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables. Never commit real values.

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes, in production | Any Postgres URL (Neon, Supabase, Vercel Postgres). Without it the site runs on an in-memory demo database and loses every change on restart. Remote connections use TLS with certificate checks. `POSTGRES_URL` and similar integration variables are ignored, and the app refuses a database that already holds another app's tables. Use an empty database. |
| `SNUGKNOT_DATABASE_URL` | When `DATABASE_URL` is taken | Wins over `DATABASE_URL`. Use it when a database integration already owns `DATABASE_URL` for something else. |
| `AUTH_SECRET` | Yes | Signs login cookies. At least 32 characters: `openssl rand -base64 32`. Changing it signs everyone out. |
| `ADMIN_EMAIL` | Yes | The store owner's admin sign-in. This address cannot be registered as a customer. |
| `ADMIN_PASSWORD` | Yes | At least 12 characters. Changing it ends every admin session and retires the old password straight away. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for links, sitemap, feeds and social previews. On Vercel the production domain is used when it is unset. |
| `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | For email (option 1) | Send store notices from a Gmail account through the Gmail API, with send-only access (see below). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | For email (option 2) | Or send through any SMTP mailbox (Hostinger: `smtp.hostinger.com`, port `465`). Used only when the Gmail variables are not set. Without either, notices are only logged in Admin → Emails. |
| `MAIL_FROM` | Optional | Sender shown on notices; defaults to `Snug&Knot <GMAIL_USER or SMTP_USER>`. |
| `NOTIFY_EMAIL` | Optional | Inbox that receives notices. Defaults to `GMAIL_USER`, else the store email in Settings. Setting it means a change in the admin panel cannot redirect notices. |
| `SNUGKNOT_RAZORPAY_KEY_ID`, `SNUGKNOT_RAZORPAY_KEY_SECRET` | For online payments | Razorpay API keys (`rzp_test_…` or `rzp_live_…`). Then switch on **Admin → Settings → Commerce → Accept online payments**. Redeploy after adding them. |
| `SNUGKNOT_RAZORPAY_WEBHOOK_SECRET` | Recommended with Razorpay | The secret you choose for the Razorpay webhook (see below). |
| `GOOGLE_SITE_VERIFICATION` | Optional | The code Google Search Console gives you for the HTML-tag method; it is added as a meta tag. |
| `BING_SITE_VERIFICATION` | Optional | The `msvalidate.01` code from Bing Webmaster Tools. |

### Store emails from a Gmail account

1. In Google Cloud Console, enable the **Gmail API** for your project.
2. **Google Auth Platform → Branding**: app name and your Gmail as the support and developer contact. **Audience**: External, then **Publish app** (while it is in *Testing*, Google expires the refresh token after 7 days). **Data access**: add the scope `https://www.googleapis.com/auth/gmail.send`.
3. **Clients → Create client → Web application**. No JavaScript origins. Authorized redirect URI: `https://developers.google.com/oauthplayground`. Copy the client ID and secret straight away; the secret is shown only once.
4. In the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground), open the gear icon, tick **Use your own OAuth credentials** and paste them. Enter the scope `https://www.googleapis.com/auth/gmail.send`, **Authorize APIs**, sign in with the Gmail account (past the "unverified app" screen: Advanced → Go to …), then **Exchange authorization code for tokens** and copy the refresh token.
5. Set `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` and `GMAIL_REFRESH_TOKEN` in Vercel, redeploy, and use **Admin → Emails → Send test email**.

The site never asks visitors to sign in with Google, so it needs no callback URL of its own. If emails start failing with `invalid_grant`, the refresh token was revoked or expired: repeat step 4.

## Selling in more than one currency

The store has a **base currency** (USD by default): every price, shipping rate and threshold in **Admin → Settings → Commerce** is in it. Under **More currencies** you can add up to three more, for example INR. Each currency has its own shipping rates, free-shipping threshold, loyalty points rate, and the countries whose shoppers see it first (e.g. `IN`).

- **Prices are set by hand, never converted.** In **Products → edit → Pricing**, each extra currency has a price and an optional compare-at price; the variant table has a column per currency for size-specific prices (empty = the product's price). A piece with no price in a currency shows "Not in INR yet" and cannot be bought in it; the settings page counts the pieces still missing one.
- **Discount codes:** a percentage code works in every currency. A fixed-amount code needs its amount per currency (and a minimum spend set in the base currency must be restated per currency), or it is refused in that currency.
- **Shoppers** see their country's currency first (from Vercel's `x-vercel-ip-country`, asked once via `/api/geo`) and can switch in the footer or the mobile menu. Their choice is kept in a cookie. Pages are pre-rendered in the base currency; for a shopper in another currency, prices stay hidden for the moment it takes to switch them, so the wrong currency never shows.
- **Orders** are priced, stored, emailed and charged in the currency the shopper saw (Razorpay charges INR orders in rupees, so UPI and Indian cards work). Orders, returns and refunds always show their own currency. The dashboard's revenue, chart and top products are in the base currency, with other currencies listed apart; customer spend is shown per currency. The shop's price filter and price sorting use the base price.
- If most shoppers use one currency, make it the base one, so pre-rendered pages already show it. Changing the base currency does not convert existing prices: re-enter them.

`scripts/currency-smoke.mjs` tests all of this end to end against a development database.

## Online payments (Razorpay)

Checkout can take payments online through [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/), next to (or instead of) cash on delivery. Card details are entered in Razorpay's window and never reach this site.

The variables start with `SNUGKNOT_` on purpose: the Vercel project also holds another app's `RAZORPAY_*` keys, and this shop must never use that account.

1. In the Razorpay dashboard, **Account & Settings → API keys**: generate a key pair. Start with **Test mode** keys (`rzp_test_…`).
2. In Vercel, set `SNUGKNOT_RAZORPAY_KEY_ID` and `SNUGKNOT_RAZORPAY_KEY_SECRET`, then redeploy.
3. **Webhooks → Add new webhook**: URL `https://www.snugandknot.com/api/webhooks/razorpay` (the `www` address: the bare domain redirects, and webhooks do not follow redirects). Choose a secret, and tick `payment.authorized`, `payment.captured`, `order.paid` and `refund.processed`. Set the same secret as `SNUGKNOT_RAZORPAY_WEBHOOK_SECRET` and redeploy.
4. **Account & Settings → Payment capture**: automatic capture is recommended (the shop also captures an authorised payment itself).
5. Prices are in the store currency (USD by default). Charging in anything other than INR needs **International payments** enabled on the Razorpay account.
6. In the admin, **Settings → Commerce → Accept online payments**. Place a test order with a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/). When it works, swap in the live keys and redeploy.

How an online order works:

- The order is saved as **awaiting payment** with its pieces held, and a Razorpay order is created for its total.
- It becomes **placed** only after Razorpay confirms a captured payment of exactly that amount and currency. The browser's report is checked with its signature, the webhook with its own, and the payment is always read back from Razorpay.
- Closing the payment window releases the pieces at once. A checkout left open is released after 30 minutes; before releasing, the shop asks Razorpay whether a payment went through.
- A payment that arrives after the release still places the order if every piece is in stock; otherwise the store is emailed to refund it.
- Unpaid online orders are hidden from customers and left out of sales figures. Refunds are made in the Razorpay dashboard; with the webhook, a full refund marks the order refunded.
- Turning the admin switch off (or removing the keys) takes online payment out of checkout straight away. Without the key, the site's security headers are exactly as they were before Razorpay.

`scripts/razorpay-smoke.mjs` tests all of this without a Razorpay account. It runs a local stand-in for the Razorpay API, which the server uses only when `SNUGKNOT_RAZORPAY_API_BASE` points at `127.0.0.1` or `localhost` and the site is not on Vercel. The script's header has the exact commands.

## Home page category grid

The "Shop by category" tiles under the hero come from Admin → Catalog → Categories: every category with "Show on home page" on and at least one active piece gets a tile, in the categories' Order, linking to `/shop/<slug>`. Each tile shows the name in capitals, the optional Badge as a small pill (up to 24 characters, e.g. `3XL TO 6XL`) and the category's Image (or, without one, a photo of one of its pieces). Images are fitted, not cropped, on a plain light ground, so a cut-out garment works best: a transparent PNG or WebP, shot from the same angle and at the same scale for every category so the row lines up.

## Search and AI crawlers

| URL | What it is |
| --- | --- |
| `/robots.txt` | Allows the shop, blocks admin, account, bag, checkout, search, order tracking and the API (except uploaded images). Preview deployments block everything and carry `noindex`. |
| `/sitemap.xml` | Every product, category, department with pieces, collection, journal post and content page, with their photographs. |
| `/llms.txt`, `/llms-full.txt` | Markdown maps of the shop for AI assistants ([llmstxt.org](https://llmstxt.org)); the full file adds product details, policies, the FAQ and journal articles. Built from the live catalogue. |
| `/journal/feed.xml` | RSS feed of the journal. |

Every indexable page has a canonical URL (filters and sorting point at the bare page) and Open Graph and Twitter tags. Pages carry schema.org data: the store and site search on the home page, `Product` with price, stock, return window and real approved reviews on product pages, breadcrumbs and item lists on categories and collections, `BlogPosting` on journal posts and `FAQPage` on the FAQ. Nothing in it is invented: there is no rating without reviews, and no shipping region or fee the shop has not published.

## Security model

- **Accounts.** Passwords are hashed with scrypt (N=2^15, r=8, p=3); older hashes are
  upgraded at the next sign-in. A failed sign-in takes the same time whether or not the
  account exists. Very common passwords are refused.
- **Sessions.** An HMAC-signed, `HttpOnly`, `SameSite=Lax` cookie (`__Host-` prefixed in
  production). Every request re-reads the user from the database, so a password change or
  role change signs out every other device. Admin sessions last 12 hours, customer sessions 30 days.
- **Admin area.** Three layers: `src/proxy.ts` turns away requests without a signed admin
  cookie, every admin page calls `requireAdminPage()`, and every admin API route calls
  `requireAdmin()`. The layout check alone is not enough in the App Router, so the
  per-page check is mandatory for new admin pages.
- **Data access.** Customers see only orders placed from their own account (never matched
  by email, since email addresses are not verified). Guest tracking needs the order number
  and email, and masks the street address and phone. Staff notes are stored apart from the
  customer's note and are never sent to customers.
- **Requests.** Writes must be same-origin JSON (CSRF), bodies are capped at 1 MB, and every
  input is validated with zod. Stored text has control and direction-override characters
  removed. Links accept only site paths or `https://`; images only site paths or the photo
  hosts in `next.config.ts`. Uploads must really be JPEG/PNG/WebP/AVIF/GIF (checked by
  their bytes), up to 4 MB, and are served with a locked-down policy.
- **Rate limits.** Stored in the database, so every server instance shares them. Applies to
  sign-in (per IP and per account), sign-up, password change, checkout, order lookup, reviews,
  returns, contact, newsletter, stock alerts, search, cart pricing and uploads. Limits are in
  `src/server/rate-limit.ts`.
- **Headers.** Content-Security-Policy, HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy and
  Cross-Origin-Opener-Policy on every page. API responses are `no-store`.
- **Database.** Every query is parameterised. Queries time out after 15 seconds.

### Known, accepted risks

- `npm audit` reports 5 high-severity issues in `braces`/`micromatch`, pulled in by
  `eslint-config-next`. No fixed `braces` release exists. The code only runs when linting
  this repository's own files on a developer machine, is not deployed, and never sees user input.
- The CSP allows inline scripts (`'unsafe-inline'`) because Next.js needs them for statically
  rendered pages. Nonces would make every page render per request.
- Email addresses are not verified, and the site does not send email (no password-reset mail).
- With Razorpay keys set, the CSP allows scripts, frames and connections to `*.razorpay.com` on every page (the shop navigates client-side, so checkout cannot have headers of its own), and the opener policy is `same-origin-allow-popups` so bank verification pop-ups can report back.
