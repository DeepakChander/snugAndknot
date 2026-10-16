# Redesign progress

The redesign is built and committed **locally**, one phase (page · section) at a time, on the
`premium-site` branch. Nothing is pushed to GitHub until the owner says so.

Each phase has a git tag on its **first** commit, so it is easy to see where a page or section
starts and what it changed:

```bash
git log --oneline --decorate premium-site      # every commit, with the phase tags
git log --oneline p1-header..p2-home-hero       # only the commits of phase 1
git diff p1-header~1 p2-home-hero~1 --stat      # every file phase 1 touched
git diff origin/main premium-site --stat        # everything the redesign changes
```

| Phase | Page · Section | Tag | Status |
|---|---|---|---|
| 1 | Site-wide · Header, and the Men / Women / Kids categories | `p1-header` | Done |
| 2 | Home · Hero | `p2-home-hero` | Done |
| 3 | Home · the other sections, one commit each | `p3-home-sections` | Done |
| 4 | Admin · quick stock, price and delete controls; INR as the default currency | `p4-admin` | Done |
| 5 | Shop · department and category pages, search | `p5-shop` | Done |
| 6 | Product page | `p6-product` | Done |
| 7 | Cart and checkout | `p7-checkout` | Done |
| 8 | Account | `p8-account` | Done |
| 9 | Info pages (about, contact, FAQ, policies, journal, lookbook, collections, 404) | `p9-info` | Done |
| 10 | Premium polish: serif headings, hero photographs and campaign mode, campaign band, dark footer | `p10-polish` | Done |
| 11 | Video wall: Instagram links play on the site; Men / Women / Kids videos on each department page | `p11-video-wall` | Done |

## Phase 1 · Header and categories

- White header: Men · Women · Kids · New in on the left, the name in the middle, search, account,
  wishlist and bag on the right. Each department opens a panel of its categories.
- Phones: a menu panel with a tab per department.
- Every category is listed in the menu; one with no pieces yet opens a "coming soon" page with a
  notify-me form (kept out of search engines until it has pieces).
- Removed site-wide: preloader, page-change curtain, custom cursor, smooth-scroll hijacking, film grain.
- Admin → Categories organised by department; the product editor offers the department's categories.
- Image prompts for every category: [category-image-prompts.md](./category-image-prompts.md).

## Phase 2 · Home hero

- The departments side by side in full-height photographs of the real pieces: Women and Men now,
  Kids once it has a photograph. Each panel opens its department; phones show two panels side by
  side, or scroll sideways through three.
- The copy and the buttons sit in a band under the photographs, so nothing covers the clothes.
- Calm motion only: the copy rises in, the photograph zooms slightly on hover. The 3D carousel is gone.
- Admin → Settings → Home page → Hero: up to three panels, each with a label, a link and an optional
  photograph (empty: one of that department's pieces).
- Photograph prompts for the three panels: [hero-image-prompts.md](./hero-image-prompts.md).
- Noted for the info-pages phase: the About page's photograph uses the same load-in zoom that
  delayed the hero's photographs; it should go the same way.

## Phase 3 · Home sections

- Site-wide foundation: white pages, calm medium-weight headings, small spaced labels, square
  buttons whose colour simply changes on hover (no rolling text, ink bubble or magnetic pull).
- Home, in order: hero, Shop by category (a tab per department, the category photographs),
  New in (the latest eight, a product grid), Collections (up to three featured), the video wall
  (light, no scroll effects), customer reviews (cards), Journal (three stories), the promises strip.
- Admin → Settings → Home page → Sections: switch each section after the hero on or off.
- Removed: the drifting fibre words, the cursor-trailing index, the word-by-word statement and the
  stacking craft cards.
- The product card used everywhere: square, the second photograph fades in on hover, one badge,
  sizes straight to the bag.
- Footer: plain and light, in normal flow (no fixed reveal or giant wordmark).

## Phase 4 · Admin

- Products: Stock (each size, one-click sold out), Price (one price for every size in each currency)
  and Delete on every row; tick rows to show, hide, archive, mark sold out, restock or delete many.
- Categories: one-click In menu / On home page on every row; open or close a whole department
  (closed: gone from every menu, the home page, the footer, the shop and the sitemap).
- Main currency: Settings → Checkout & shipping → Change the main currency converts every amount at
  your rate (e.g. USD → INR); the old currency stays on with its exact old prices.
- Announcement: write {free-shipping} for the free-shipping amount in each shopper's currency.

## Phase 5 · Shop

- Shop all, departments and categories: a plain title and item count; a department's page shows
  its categories as photograph tiles; a slim sticky toolbar (department tabs, category links, sort,
  filter, three or four per row); four across by default. Search is a light panel and page.

## Phase 6 · Product page

- Desktop: every photograph in two columns with the buy panel sticky beside them; phone: edge-to-edge
  swipe with dots. Calm buy panel; the dark yarn band is gone; plain sticky buy bar on phones.

## Phase 7 · Cart and checkout

- Square panels, fields and steppers, ink instead of gold, a light order confirmation; the checkout
  no longer scrolls sideways on phones.

## Phase 8 · Account

- Calm account pages and dialogs; shopper-facing copy talks about the shop, not an atelier.

## Phase 9 · Information pages

- Light, still headers everywhere; Journal articles, Collections, the Lookbook and the 404 page
  rebuilt without dark full-screen heroes, pinned scrolling or letter-by-letter titles. The scroll
  and text animation code and the GSAP packages are removed; one calm fade-in remains.

## Phase 10 · Premium polish

- Display headings in the serif (Instrument Serif) across the site; section lines above each heading.
- Hero: new default photographs for the Women and Men panels, the department named large on each
  panel, and an optional wide **campaign photograph** (Settings → Home page → Hero) that fills the
  first screen with the title, buttons and department links over it.
- A dark **campaign band** after New in: one collection set large with three of its pieces, chosen
  in Settings → Home page → Campaign band (switch, collection, photograph, button label).
- A dark footer: serif sign-off with the newsletter, link columns (Shop built from the open
  departments), customer care and socials, the ways to pay from the checkout settings, the store
  name set large, and the small print.
- Prompts for the campaign photograph and the band in `docs/hero-image-prompts.md`.
- The hero now opens on the generated campaign photograph, with the Women, Men and Kids photographs
  as a row of tiles under it (`public/images/hero/`). Removing the campaign photograph in the admin
  brings back the three panels side by side.

## Phase 11 · Video wall

- Paste an Instagram reel or post link in Admin → Videos and it shows on the site through
  Instagram's own embed: its cover in the tile, playing in the full-screen viewer beside the tagged
  pieces. No poster is needed (one can still be uploaded). The post must be public.
- Each video has a department. The Women, Men and Kids pages show only their own videos under the
  pieces; the home page shows them all with All / Women / Men / Kids tabs.
- The look follows the reference gallery: centred hashtag heading, invitation and button, square
  4:5 tiles with a "View products" count and the Instagram mark, the first eight then View all.

## Before going live

1. Push `premium-site` and open its pull request to `main` (merging it deploys the live shop).
2. On go-live the database moves from version 11 to 15 by itself (departments and categories, the
   category photographs, categories on the home page, the announcement's free-shipping amount).
3. Switch the main currency to INR in Admin → Settings → Checkout & shipping → Change the main
   currency, at the exchange rate you choose.
4. Add the 15 Kids category photographs in Admin → Categories → Kids → Edit → Image so Kids gets its
   tiles under Shop by category. (The Kids hero photograph is already in place.)

