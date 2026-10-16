# Redesign progress

The redesign is built and committed **locally**, one phase (page · section) at a time, on the
`premium-site` branch. Nothing is pushed to GitHub until the owner says so.

Each phase has a git tag on its **first** commit, so it is easy to see where a page or section
starts and what it changed:

```bash
git log --oneline --decorate premium-site      # every commit, with the phase tags
git log --oneline p1-header..p2-home-hero       # only the commits of phase 1
git diff p1-header~1 p2-home-hero~1 --stat      # every file phase 1 touched
```

| Phase | Page · Section | Tag | Status |
|---|---|---|---|
| 1 | Site-wide · Header, and the Men / Women / Kids categories | `p1-header` | Done |
| 2 | Home · Hero | `p2-home-hero` | Done |
| 3 | Home · the other sections, one commit each | `p3-home-sections` | Done |
| 4 | Admin · quick stock, price and delete controls; INR as the default currency | `p4-admin` | Done |
| 5 | Shop · department and category pages | `p5-shop` | Next |
| 6 | Product page | `p6-product` | To do |
| 7 | Cart and checkout | `p7-checkout` | To do |
| 8 | Account | `p8-account` | To do |
| 9 | Info pages (about, contact, FAQ, policies) | `p9-info` | To do |

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

