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
| `GOOGLE_SITE_VERIFICATION` | Optional | The code Google Search Console gives you for the HTML-tag method; it is added as a meta tag. |
| `BING_SITE_VERIFICATION` | Optional | The `msvalidate.01` code from Bing Webmaster Tools. |

### Store emails from a Gmail account

1. In Google Cloud Console, enable the **Gmail API** for your project.
2. **Google Auth Platform → Branding**: app name and your Gmail as the support and developer contact. **Audience**: External, then **Publish app** (while it is in *Testing*, Google expires the refresh token after 7 days). **Data access**: add the scope `https://www.googleapis.com/auth/gmail.send`.
3. **Clients → Create client → Web application**. No JavaScript origins. Authorized redirect URI: `https://developers.google.com/oauthplayground`. Copy the client ID and secret straight away; the secret is shown only once.
4. In the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground), open the gear icon, tick **Use your own OAuth credentials** and paste them. Enter the scope `https://www.googleapis.com/auth/gmail.send`, **Authorize APIs**, sign in with the Gmail account (past the "unverified app" screen: Advanced → Go to …), then **Exchange authorization code for tokens** and copy the refresh token.
5. Set `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` and `GMAIL_REFRESH_TOKEN` in Vercel, redeploy, and use **Admin → Emails → Send test email**.

The site never asks visitors to sign in with Google, so it needs no callback URL of its own. If emails start failing with `invalid_grant`, the refresh token was revoked or expired: repeat step 4.

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
