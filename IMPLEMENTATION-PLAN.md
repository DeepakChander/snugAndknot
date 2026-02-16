# SNUG & KNOT — Complete Feature Implementation Plan

> **Reference**: Andamen.com | **Goal**: Build a superior luxury e-commerce experience
> **Constraint**: Only 4 real products — never show blank/empty product boxes
> **Design Philosophy**: Every feature gets a unique, award-winning animation with 3D elements

---

## Table of Contents

1. [Phase 0: Foundation Setup](#phase-0-foundation-setup)
2. [Phase 1: HIGH PRIORITY Features](#phase-1-high-priority)
3. [Phase 2: MEDIUM PRIORITY Features](#phase-2-medium-priority)
4. [Phase 3: NICE TO HAVE Features](#phase-3-nice-to-have)
5. [3D Animation System](#3d-animation-system)
6. [Product Display Rules](#product-display-rules)

---

## Phase 0: Foundation Setup

### 0.1 — Install 3D & Animation Dependencies

```bash
npm install three @types/three @react-three/fiber @react-three/drei
```

**Why**: Three.js + React Three Fiber gives us WebGL-powered 3D scenes that integrate seamlessly with React. Drei provides ready-made 3D helpers (orbit controls, text, environments, etc.)

### 0.2 — Create 3D Scene Wrapper Component

**File**: `src/components/3d/SceneWrapper.tsx`

A reusable wrapper that:
- Lazy-loads the WebGL canvas (no SSR)
- Auto-detects device capability (falls back to 2D on low-end devices)
- Respects `prefers-reduced-motion`
- Handles resize/responsive behavior
- Uses our burgundy/gold/ivory color palette for lighting

### 0.3 — Create 3D Knot Model

**File**: `src/components/3d/KnotModel.tsx`

A procedurally generated 3D torus knot (Three.js TorusKnotGeometry) that becomes the brand's signature 3D element:
- Burgundy metallic material with gold specular highlights
- Subtle continuous rotation animation
- Responds to mouse movement (parallax tilt)
- GSAP ScrollTrigger integration for scroll-based transforms
- Used across multiple features as a recurring brand motif

### 0.4 — Smart Product Display Utility

**File**: `src/lib/smart-grid.ts`

A utility that ensures **no blank product boxes ever appear**:

```typescript
// Dynamically adjusts grid columns based on product count
// 4 products → 4-col (desktop), 2-col (mobile)
// 3 products → 3-col (desktop), 1+2 layout (mobile)
// 2 products → 2-col centered
// 1 product → single centered with editorial layout

export function getSmartGridConfig(productCount: number): GridConfig
export function getSmartSliceCount(products: Product[], maxDesired: number): number
```

**Rules**:
- Never slice more products than available
- Grid columns never exceed product count
- On homepage sections: show all 4 products in a single row (desktop) or 2×2 grid (mobile)
- On shop page: 4 products in centered 4-col or 2×2 layout
- Related products: show max 3 (exclude current product from 4)

---

## Phase 1: HIGH PRIORITY

---

### 1.1 — User Authentication System

**New Files**:
- `src/stores/auth-store.ts` — Zustand store with persistence
- `src/components/auth/AuthModal.tsx` — Login/Signup modal
- `src/components/auth/AuthForm.tsx` — Form with toggle between login/signup
- `src/components/auth/ForgotPasswordForm.tsx`
- `src/app/account/page.tsx` — Account dashboard
- `src/app/account/orders/page.tsx` — Order history
- `src/app/account/wishlist/page.tsx` — Saved items

**Modify**:
- `src/components/layout/Header.tsx` — Add user icon with dropdown
- `src/stores/wishlist-store.ts` — Link to user account
- `src/types/index.ts` — Add User, Order, Address types

**Design & Animation**:

```
┌─────────────────────────────────────┐
│        AUTH MODAL CONCEPT           │
│                                     │
│   ┌─────────┬─────────────────┐     │
│   │         │                 │     │
│   │  3D     │   Login Form    │     │
│   │  Knot   │                 │     │
│   │  Scene  │   Email [____]  │     │
│   │         │   Pass  [____]  │     │
│   │ (slowly │                 │     │
│   │  rotates│   [  Sign In  ] │     │
│   │  + mouse│                 │     │
│   │  react) │   ─── or ───   │     │
│   │         │                 │     │
│   │         │   New here?     │     │
│   │         │   Create acct → │     │
│   └─────────┴─────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

- **3D Knot Scene**: Left panel shows a rotating 3D torus knot with burgundy metallic material and gold rim lighting. The knot "unties" when switching from Login → Signup (morphs from knot to open thread) and "ties" back on Login
- **Form Entrance**: Fields slide in with staggered `yarn-pull` easing from right
- **Input Focus**: Gold thread line draws under focused input (animated stroke-dasharray)
- **Submit Button**: Magnetic hover effect (already have `useMagneticHover`), button fills with gold gradient wave on hover
- **Success**: 3D knot does a celebratory spin + particle burst, then modal dissolves with clip-path circle
- **Error Shake**: Form does a gentle horizontal shake with `selvage-snap` spring easing
- **Toggle Animation**: Login/Signup switch uses a cloth-fold transition (clip-path polygon morph)

**Auth Store Structure**:
```typescript
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  authMode: 'login' | 'signup' | 'forgot-password'
  login(email: string, password: string): Promise<void>
  signup(name: string, email: string, password: string): Promise<void>
  logout(): void
  openAuthModal(mode?: 'login' | 'signup'): void
  closeAuthModal(): void
}
```

> **Note**: For now this uses localStorage-based mock auth. Structure is ready for Shopify Customer API migration.

---

### 1.2 — Order Tracking System

**New Files**:
- `src/app/account/orders/[id]/page.tsx` — Individual order detail
- `src/components/account/OrderTimeline.tsx` — Visual timeline
- `src/components/account/OrderCard.tsx` — Order summary card
- `src/components/3d/ThreadJourney.tsx` — 3D order tracking visualization
- `src/data/orders.json` — Mock order data

**Design & Animation**:

```
┌──────────────────────────────────────────────┐
│           ORDER TRACKING PAGE                │
│                                              │
│   Order #SNK-2024-0847                       │
│                                              │
│   ╔══════════════════════════════════════╗    │
│   ║        3D THREAD JOURNEY            ║    │
│   ║                                     ║    │
│   ║   🧵─────●─────●─────●─────○       ║    │
│   ║   Placed  Confirmed Shipped  Delivered  ║
│   ║                                     ║    │
│   ║   (3D thread weaves between nodes,  ║    │
│   ║    animates to current status,      ║    │
│   ║    nodes are 3D spheres that glow)  ║    │
│   ╚══════════════════════════════════════╝    │
│                                              │
│   📦 Items (2)          Shipping Address     │
│   ┌─────────────┐      142 Mercer St         │
│   │ Product img  │      New York, NY 10012   │
│   │ + details    │                           │
│   └─────────────┘      Est. Delivery: Feb 20 │
│                                              │
└──────────────────────────────────────────────┘
```

- **3D Thread Journey**: A WebGL scene where a gold thread weaves through 3D milestone nodes (spheres on pedestals). The thread animates drawing from start to current status using GSAP ScrollTrigger. Completed nodes glow gold, upcoming nodes are muted burgundy wireframe
- **Node Hover**: Hovering a 3D node shows a tooltip card with date/time details, the sphere scales up with `loom-settle` easing
- **Page Entrance**: Order details cards cascade in with staggered `fade-up` + subtle rotateY (3D card flip feel)
- **Status Badge**: Pulses with a soft gold glow animation (CSS keyframes)

---

### 1.3 — Payment & Checkout Flow

**New Files**:
- `src/app/checkout/page.tsx` — Multi-step checkout
- `src/components/checkout/CheckoutStepper.tsx` — Step indicator
- `src/components/checkout/ShippingForm.tsx`
- `src/components/checkout/PaymentForm.tsx`
- `src/components/checkout/OrderReview.tsx`
- `src/components/checkout/OrderConfirmation.tsx`
- `src/components/3d/CheckoutThread.tsx` — 3D step visualization
- `src/stores/checkout-store.ts`

**Design & Animation**:

```
┌──────────────────────────────────────────────┐
│              CHECKOUT FLOW                   │
│                                              │
│   ═══●═══════●═══════○═══════○               │
│   Info    Shipping  Payment  Review          │
│                                              │
│   (3D thread connects the steps,             │
│    gold section = completed,                 │
│    burgundy = current, grey = upcoming)      │
│                                              │
│   ┌────────────────────┬──────────────┐      │
│   │                    │              │      │
│   │   SHIPPING INFO    │  ORDER       │      │
│   │                    │  SUMMARY     │      │
│   │   Name [________]  │              │      │
│   │   Address [_____]  │  Product 1   │      │
│   │   City [_________]  │  Product 2   │      │
│   │   Zip [__________]  │              │      │
│   │                    │  Subtotal    │      │
│   │   [  Continue →  ]  │  Shipping   │      │
│   │                    │  Total       │      │
│   └────────────────────┴──────────────┘      │
│                                              │
└──────────────────────────────────────────────┘
```

- **3D Step Indicator**: A Three.js scene showing a thread weaving through step markers. As user progresses, the thread draws forward with a satisfying animation. Each completed step's marker morphs from a circle to the brand's knot symbol
- **Step Transitions**: Content slides with `warp-tension` easing (page-like flip). Old content exits left + fades, new content enters right
- **Form Inputs**: Floating labels with gold underline draw animation (already established pattern from contact page)
- **Order Summary**: Sticky sidebar with product thumbnails that have a subtle 3D hover tilt (CSS perspective transform)
- **Confirmation Page**: Full-screen celebration — 3D knot unravels into confetti particles, "Order Confirmed" text reveals word-by-word with `TextReveal`, order number appears with typewriter effect

---

### 1.4 — Loyalty & Rewards Program

**New Files**:
- `src/stores/loyalty-store.ts`
- `src/app/account/rewards/page.tsx` — Rewards dashboard
- `src/components/loyalty/RewardsCard.tsx` — Points display card
- `src/components/loyalty/TierBadge.tsx` — Tier indicator
- `src/components/loyalty/PointsHistory.tsx`
- `src/components/loyalty/RewardsMeter.tsx` — Progress to next tier
- `src/components/3d/LoyaltyKnot.tsx` — 3D tier visualization

**Tier System Design**:

```
┌─────────────────────────────────────────────┐
│           TIER SYSTEM                       │
│                                             │
│   🧵 Thread     0 - 499 pts    (5% back)   │
│   🪡 Stitch     500 - 1499 pts (8% back)   │
│   🧶 Weave      1500 - 2999 pts (12% back) │
│   👑 Tapestry   3000+ pts      (15% back)  │
│                                             │
└─────────────────────────────────────────────┘
```

**Design & Animation**:

```
┌──────────────────────────────────────────────┐
│           REWARDS DASHBOARD                  │
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │          3D LOYALTY KNOT             │   │
│   │                                      │   │
│   │    (Complexity increases by tier:     │   │
│   │     Thread = simple loop             │   │
│   │     Stitch = figure-8               │   │
│   │     Weave  = celtic knot            │   │
│   │     Tapestry = ornate torus knot)   │   │
│   │                                      │   │
│   │         1,247 Points                 │   │
│   │     ══════════════════               │   │
│   │     253 pts to WEAVE tier            │   │
│   └──────────────────────────────────────┘   │
│                                              │
│   How to Earn          Recent Activity       │
│   ┌──────────┐         ┌──────────────┐      │
│   │ Purchase │ +10/$ │ Feb 14 +120pts │      │
│   │ Review   │ +50   │ Feb 10 +50pts  │      │
│   │ Referral │ +200  │ Jan 28 -500pts │      │
│   │ Birthday │ +100  │ (redeemed)     │      │
│   └──────────┘         └──────────────┘      │
│                                              │
└──────────────────────────────────────────────┘
```

- **3D Loyalty Knot**: A Three.js scene showing a knot whose complexity reflects the user's tier. Thread tier = simple torus, Tapestry tier = ornate TorusKnotGeometry(3,7). The knot is gold with burgundy accents, slowly rotating
- **Tier Progress Bar**: Gold thread that draws along a track. When reaching a new tier, a burst of gold particles explodes from the knot and it morphs to the next complexity level
- **Points Counter**: Numbers animate with GSAP (counting up from 0 to current), with easeOut
- **Earning Cards**: Glass-morphism cards with hover tilt (CSS 3D perspective) and gold border glow

---

### 1.5 — Returns Management Portal

**New Files**:
- `src/app/account/returns/page.tsx` — Returns dashboard
- `src/app/account/returns/new/page.tsx` — Start return flow
- `src/components/returns/ReturnStepper.tsx`
- `src/components/returns/ReturnReasonSelector.tsx`
- `src/components/returns/ReturnStatusCard.tsx`

**Design & Animation**:

- **Return Flow**: 3-step wizard (Select Items → Reason → Confirmation) with the same 3D thread stepper as checkout
- **Reason Selector**: Large, tactile cards with icons that do a 3D flip on selection (rotateY 180deg reveals checkmark on back)
- **Status Tracking**: Reuses the Thread Journey component from order tracking, but in reverse direction (the thread "unweaves")
- **Confirmation**: Gentle animation — knot loosens (3D morph) with a reassuring message

---

### 1.6 — Coupon & Discount Code System

**New Files**:
- `src/components/checkout/CouponInput.tsx`
- `src/components/ui/DiscountBadge.tsx`
- `src/data/coupons.json` — Mock coupon data

**Modify**:
- `src/stores/cart-store.ts` — Add coupon state and discount calculation
- `src/components/layout/CartDrawer.tsx` — Add coupon input
- `src/app/cart/page.tsx` — Add coupon section

**Design & Animation**:

- **Coupon Input**: A golden-bordered input that, on valid code entry, triggers a "thread pull" animation — a gold thread visually snakes from the input down to the total, and the price animates counting down to the new amount
- **Invalid Code**: Input border flashes with `error-garnet` color, subtle shake with `selvage-snap` spring easing
- **Discount Badge on Products**: Animated badge that does a subtle scale-pulse (1.0 → 1.05 → 1.0 loop)
- **Member-Exclusive Badge**: Gold shimmer effect sweeping across the badge text (CSS gradient animation)

---

## Phase 2: MEDIUM PRIORITY

---

### 2.1 — Mega Menu Navigation

**New Files**:
- `src/components/layout/MegaMenu.tsx`
- `src/components/layout/MegaMenuPanel.tsx`

**Modify**:
- `src/components/layout/Header.tsx` — Replace simple nav with mega menu triggers

**Design & Animation**:

```
┌──────────────────────────────────────────────────────┐
│  LOGO        Shop ▾   Collections   Lookbook   About │
├──────────────────────────────────────────────────────┤
│                                                      │
│   MEGA MENU (on "Shop" hover)                        │
│                                                      │
│   ┌────────────┬────────────┬────────────────────┐   │
│   │            │            │                    │   │
│   │  By Gender │ By Category│   FEATURED IMAGE   │   │
│   │            │            │                    │   │
│   │  → Men     │  → Tops    │   ┌──────────┐    │   │
│   │  → Women   │  → Bottoms │   │  Season's │    │   │
│   │  → Kids    │  → Dresses │   │  Edit     │    │   │
│   │            │  → Outer   │   │  [image]  │    │   │
│   │  New In ✨  │  → Access  │   │           │    │   │
│   │  Sale 🔴   │            │   └──────────┘    │   │
│   │            │            │                    │   │
│   └────────────┴────────────┴────────────────────┘   │
│                                                      │
│   (Gold thread decorative line at bottom)            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- **Entrance**: Panel drops down with `loom-settle` easing (sharp deceleration), height animates from 0. Content fades in with 100ms stagger per column
- **Featured Image**: Parallax tilt on mouse move (CSS 3D perspective transform), with a gold border that draws on menu open
- **Link Hover**: Each link has a gold thread underline that draws from left to right (stroke-dasharray animation)
- **Exit**: Panel height collapses with `yarn-pull` easing, content fades out simultaneously
- **Gold Thread**: Decorative bottom border animates width from center outward on open

---

### 2.2 — Quick Add to Cart Modal

**New Files**:
- `src/components/product/QuickAddModal.tsx`

**Modify**:
- `src/components/product/ProductCard.tsx` — Update quick-add button to open modal

**Design & Animation**:

```
┌──────────────────────────────────────┐
│         QUICK ADD MODAL              │
│                                      │
│  ┌──────────┬───────────────────┐    │
│  │          │                   │    │
│  │ Product  │  Product Title    │    │
│  │ Image    │  $189.00          │    │
│  │          │                   │    │
│  │ (3D tilt │  Color: ● ● ● ●  │    │
│  │  on      │                   │    │
│  │  hover)  │  Size: S M L XL  │    │
│  │          │                   │    │
│  │          │  Qty: [- 1 +]    │    │
│  │          │                   │    │
│  │          │  [ ADD TO BAG ]   │    │
│  │          │                   │    │
│  └──────────┴───────────────────┘    │
│                                      │
└──────────────────────────────────────┘
```

- **Modal Entrance**: Scales from the product card's position (origin-aware animation). The card appears to "expand" into the modal using FLIP animation technique
- **Product Image**: CSS 3D perspective tilt on mouse move (tiltX/tiltY based on cursor position)
- **Color Swatches**: Pop in with staggered scale + bounce (`selvage-snap` spring easing)
- **Size Buttons**: Draw-in with border animation (similar to product card hover)
- **Add to Bag**: Magnetic hover effect, on click the button morphs into a checkmark with particle burst
- **Close**: Modal shrinks back toward the originating card position (reverse FLIP)

---

### 2.3 — Color Variant Swatches on Product Cards

**Modify**:
- `src/components/product/ProductCard.tsx` — Add interactive color dots with image swap

**Design & Animation**:

- **Swatch Display**: Show color dots (max 4 + "+N more" indicator) below product title
- **Hover Preview**: On color dot hover, product image crossfades to variant image using clip-path circle expand from the dot's position
- **Selected State**: Active dot gets a gold ring border that draws in (SVG circle stroke-dasharray)
- **Dot Entrance**: When card enters viewport, dots stagger in with scale-from-zero + `selvage-snap` bounce, 60ms apart

---

### 2.4 — Predictive Search Enhancement

**Modify**:
- `src/components/layout/SearchOverlay.tsx` — Add rich result previews

**Design & Animation**:

```
┌────────────────────────────────────────┐
│                                        │
│   🔍 [cashmere car_____________]       │
│                                        │
│   ── Suggestions ──────────────────    │
│   cashmere cardigan                    │
│   cashmere care instructions           │
│                                        │
│   ── Products ─────────────────────    │
│   ┌──────┐  Ivory Cable Knit          │
│   │ img  │  Cardigan — $189.00         │
│   └──────┘                             │
│   ┌──────┐  Terracotta Textured        │
│   │ img  │  Cardigan — $169.00         │
│   └──────┘                             │
│                                        │
│   ── Categories ───────────────────    │
│   → Tops  → Outerwear                  │
│                                        │
│   View all results for "cashmere" →    │
│                                        │
└────────────────────────────────────────┘
```

- **Result Entrance**: Results cascade in with staggered `fade-up`, each item 50ms delayed
- **Product Thumbnails**: Subtle 3D tilt on hover (CSS perspective)
- **Typing Animation**: The search underline pulses gold while actively typing
- **Category Links**: Gold thread underline draws on hover
- **No Results**: A gentle 3D knot animation with "No pieces found" text reveal

---

### 2.5 — Size Guide Component

**New Files**:
- `src/components/product/SizeGuide.tsx`
- `src/components/product/SizeGuideModal.tsx`
- `src/data/size-guide.json`

**Modify**:
- `src/app/product/[slug]/page.tsx` — Add "Size Guide" link near size selector

**Design & Animation**:

```
┌──────────────────────────────────────────┐
│            SIZE GUIDE                    │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │      3D MANNEQUIN / BODY         │   │
│   │                                  │   │
│   │    (Interactive 3D silhouette     │   │
│   │     with measurement points      │   │
│   │     that glow when hovered)      │   │
│   │                                  │   │
│   │     ←── Chest: 38-40" ──→       │   │
│   │     ←── Waist: 32-34" ──→       │   │
│   │     ←── Hips: 40-42"  ──→       │   │
│   └──────────────────────────────────┘   │
│                                          │
│   Size Chart Table                       │
│   ┌────┬────────┬───────┬───────────┐    │
│   │ S  │ 36-38  │ 28-30 │ 36-38     │    │
│   │ M  │ 38-40  │ 30-32 │ 38-40     │    │
│   │ L  │ 40-42  │ 32-34 │ 40-42     │    │
│   │ XL │ 42-44  │ 34-36 │ 42-44     │    │
│   └────┴────────┴───────┴───────────┘    │
│                                          │
│   [ Find My Size ]                       │
│                                          │
└──────────────────────────────────────────┘
```

- **3D Body Silhouette**: A minimal wireframe human form rendered in Three.js with measurement lines that glow gold when the user hovers a size row. The measurement lines animate drawing between body points
- **Table Row Hover**: Row highlights with gold background fade-in, corresponding measurement on 3D body glows
- **"Find My Size"**: Opens a quick questionnaire (height, weight, preference) with animated step transitions
- **Modal Entrance**: Scales up from the "Size Guide" link with backdrop blur

---

### 2.6 — "Complete the Look" / Shop Together

**New Files**:
- `src/components/product/CompleteTheLook.tsx`
- `src/components/3d/OutfitScene.tsx`

**Modify**:
- `src/app/product/[slug]/page.tsx` — Add section below product details

**Design & Animation**:

```
┌──────────────────────────────────────────────┐
│        COMPLETE THE LOOK                     │
│                                              │
│   ┌─────────────────────────────────────┐    │
│   │         3D OUTFIT COMPOSER          │    │
│   │                                     │    │
│   │    [Top]──────[Bottom]──[Accessory] │    │
│   │                                     │    │
│   │   Products float in 3D space,       │    │
│   │   connected by gold thread lines,   │    │
│   │   slowly orbiting a central point   │    │
│   │                                     │    │
│   └─────────────────────────────────────┘    │
│                                              │
│   ┌────────┐  ┌────────┐  ┌────────┐        │
│   │Product │  │Product │  │Product │        │
│   │Card 1  │  │Card 2  │  │Card 3  │        │
│   │(current│  │(match) │  │(match) │        │
│   └────────┘  └────────┘  └────────┘        │
│                                              │
│   Total Look: $487.00  [ ADD ALL TO BAG ]    │
│                                              │
└──────────────────────────────────────────────┘
```

- **3D Outfit Composer**: Product images float as 3D planes in a Three.js scene, connected by animated gold thread (TubeGeometry following a CatmullRomCurve3). Products slowly orbit. Clicking a product zooms the camera to it
- **Product Cards Below**: Standard cards with staggered entrance, but each has a "thread connection" line drawn between them (SVG path)
- **Add All Button**: On click, all product cards animate "flying" toward the cart icon in the header (GSAP motion path)
- **Total Price**: Counts up with GSAP number animation when section enters viewport

> **With 4 products**: Current product + 3 complementary products = perfect 3-card layout for suggestions

---

## Phase 3: NICE TO HAVE

---

### 3.1 — Member-Exclusive Pricing

**New Files**:
- `src/components/product/MemberPrice.tsx`
- `src/components/ui/MemberBadge.tsx`

**Modify**:
- `src/components/product/ProductCard.tsx` — Show member price when logged in
- `src/app/product/[slug]/page.tsx` — Dual pricing display

**Design & Animation**:

- **Price Display**: Non-members see regular price + small "Members save 15%" teaser with gold shimmer
- **Member Price Reveal**: When logged in, member price slides in from right with a gold sparkle trail effect. Regular price gets a subtle strikethrough with `fiber-drift` easing
- **Member Badge**: "MEMBER EXCLUSIVE" badge with animated gold gradient sweep (background-position animation)
- **Lock Icon**: For non-members, a small animated lock icon that "unlocks" when they hover (rotate keyframe), with tooltip "Sign in for exclusive pricing"

---

### 3.2 — Wishlist Enhancement & Sharing

**New Files**:
- `src/app/account/wishlist/page.tsx` — Full wishlist page (if not created in 1.1)
- `src/components/wishlist/WishlistShareModal.tsx`
- `src/components/wishlist/WishlistCard.tsx`

**Modify**:
- `src/stores/wishlist-store.ts` — Add share functionality

**Design & Animation**:

```
┌──────────────────────────────────────────────┐
│           MY WISHLIST                        │
│                                              │
│   "Pieces you're dreaming about"             │
│                                              │
│   ┌────────┐  ┌────────┐  ┌────────┐        │
│   │ ♥      │  │ ♥      │  │ ♥      │        │
│   │Product │  │Product │  │Product │        │
│   │Card    │  │Card    │  │Card    │        │
│   └────────┘  └────────┘  └────────┘        │
│                                              │
│   [ SHARE WISHLIST 🔗 ]   [ ADD ALL TO BAG ] │
│                                              │
└──────────────────────────────────────────────┘
```

- **Heart Animation**: When adding to wishlist, the heart icon does a scale-up burst (1.0 → 1.6 → 1.0) with tiny heart particles floating upward, then color fills from outline to solid burgundy
- **Removing**: Heart "breaks" animation — splits into two halves that fall with physics easing, then fades
- **Share Modal**: Generates a shareable link with a "link copied" animation — a gold thread draws a checkmark
- **Empty Wishlist**: 3D scene with a single gold thread slowly weaving itself into a heart shape, with "Start collecting pieces you love" text reveal

---

### 3.3 — Newsletter with Incentive Popup

**New Files**:
- `src/components/marketing/WelcomePopup.tsx`
- `src/components/3d/NewsletterKnot.tsx`

**Modify**:
- `src/components/home/Newsletter.tsx` — Enhanced with incentive

**Design & Animation**:

```
┌──────────────────────────────────────┐
│        WELCOME POPUP                 │
│   (appears after 5s on first visit)  │
│                                      │
│   ┌──────────────────────────────┐   │
│   │                              │   │
│   │     3D GIFT BOX / KNOT      │   │
│   │     (unwrapping animation)   │   │
│   │                              │   │
│   │   Get 10% Off Your           │   │
│   │   First Order                │   │
│   │                              │   │
│   │   Email [________________]   │   │
│   │                              │   │
│   │   [ CLAIM MY DISCOUNT ]     │   │
│   │                              │   │
│   │   No thanks, full price →    │   │
│   │                              │   │
│   └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

- **3D Gift Scene**: A miniature 3D gift box wrapped with a gold ribbon. On popup appearance, the ribbon animates untying and the box lid opens, revealing a glowing "10%" text floating up
- **Popup Entrance**: Scale from center with backdrop blur fade-in, `loom-settle` easing
- **Submit Success**: Box explodes into gold confetti particles, replaced by a coupon code reveal with typewriter effect
- **Timer**: Only shows after 5 seconds on site, doesn't re-show for 7 days (localStorage check)

---

### 3.4 — Live Chat Support Widget

**New Files**:
- `src/components/support/ChatWidget.tsx`
- `src/components/support/ChatBubble.tsx`
- `src/components/support/ChatMessage.tsx`
- `src/stores/chat-store.ts`

**Design & Animation**:

```
┌──────────────────────────────────┐
│      CHAT WIDGET                 │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Snug & Knot Support       │  │
│  │  ● Online                  │  │
│  ├────────────────────────────┤  │
│  │                            │  │
│  │  👋 Hi! How can we help?   │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ Shipping question    │  │  │
│  │  │ Size help            │  │  │
│  │  │ Return request       │  │  │
│  │  │ Other                │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  [Type a message...]  [→]  │  │
│  └────────────────────────────┘  │
│                                  │
│                      [💬 Chat]   │
│                    (FAB button)  │
└──────────────────────────────────┘
```

- **FAB Button**: Floating burgundy circle with a gold chat icon. On hover, magnetically attracts toward cursor (`useMagneticHover`). Has a subtle breathing scale animation (1.0 → 1.02 → 1.0 loop)
- **Open Animation**: Chat window expands from the FAB button's position using FLIP technique. The FAB morphs into the chat header
- **Message Bubbles**: Each message slides in from bottom with `yarn-pull` easing. Bot messages have a brief typing indicator (3 bouncing dots)
- **Quick Reply Buttons**: Appear with staggered scale-in animation
- **Close**: Window shrinks back into FAB with reverse animation
- **Notification Dot**: Pulsing gold dot appears on FAB when there's an unread message

> **Note**: This is a UI-ready chat widget. Backend integration (Intercom, Tawk.to, or custom) can be added later.

---

### 3.5 — Analytics Dashboard (Frontend Tracking)

**New Files**:
- `src/lib/analytics.ts` — Event tracking utility
- `src/components/analytics/AnalyticsProvider.tsx`

**Modify**:
- `src/app/layout.tsx` — Add analytics provider
- Key interaction points — Add tracking calls

**Events to Track**:
```
page_view, product_view, add_to_cart, remove_from_cart,
wishlist_add, wishlist_remove, search_query, filter_applied,
checkout_started, checkout_completed, coupon_applied,
newsletter_signup, chat_opened, size_guide_viewed
```

- **Implementation**: A lightweight event bus that logs to console in dev and can be connected to GTM/Pixel/Mixpanel in production
- **No UI needed** — this is infrastructure only

---

### 3.6 — Recently Viewed Products

**New Files**:
- `src/stores/recently-viewed-store.ts`
- `src/components/product/RecentlyViewed.tsx`

**Modify**:
- `src/app/product/[slug]/page.tsx` — Track viewed products
- `src/app/shop/page.tsx` — Show recently viewed section

**Design & Animation**:

- **Section**: Horizontal scrolling strip at bottom of shop/product pages
- **Cards**: Mini product cards that slide in from right with staggered entrance
- **Scroll**: Smooth horizontal scroll with grab cursor, momentum-based (GSAP Draggable feel via CSS scroll-snap)
- **New Entry**: When a product is viewed, its card slides into the leftmost position with a `loom-settle` ease, pushing others right
- **Storage**: Max 10 items, persisted to localStorage via Zustand

---

### 3.7 — Back in Stock Notifications

**New Files**:
- `src/components/product/BackInStockForm.tsx`
- `src/components/ui/NotifyBadge.tsx`

**Modify**:
- `src/app/product/[slug]/page.tsx` — Show form for out-of-stock variants

**Design & Animation**:

- **Trigger**: When a size/color variant is out of stock, the "Add to Bag" button transforms into "Notify Me" with a smooth morph animation (width change, color shift burgundy → gold outline, text crossfade)
- **Form**: Email input slides down from the button position with `loom-settle` easing
- **Submit**: Button morphs to a bell icon with a ring animation (rotate wiggle), confirming notification is set
- **Badge**: Tiny bell icon appears on the product card for items user has subscribed to

---

## 3D Animation System — Master Reference

### Global 3D Elements

| Element | Component | Used In | Description |
|---------|-----------|---------|-------------|
| **Brand Knot** | `KnotModel.tsx` | Auth, Loyalty, 404, About | Signature 3D torus knot, burgundy + gold |
| **Thread Journey** | `ThreadJourney.tsx` | Order Tracking, Checkout | Gold thread weaving through milestone nodes |
| **Gift Box** | `NewsletterKnot.tsx` | Welcome Popup | Animated unwrapping gift box |
| **Outfit Composer** | `OutfitScene.tsx` | Complete the Look | Products as 3D planes connected by thread |
| **Body Silhouette** | `SizeGuide.tsx` | Size Guide Modal | Wireframe mannequin with measurement lines |
| **Loyalty Knot** | `LoyaltyKnot.tsx` | Rewards Dashboard | Tier-based knot complexity |

### 3D Material Palette

```
Primary Metal:    MeshStandardMaterial({ color: '#5B0E14', metalness: 0.7, roughness: 0.3 })
Gold Accent:      MeshStandardMaterial({ color: '#F1E194', metalness: 0.9, roughness: 0.1 })
Thread:           MeshBasicMaterial({ color: '#D4A843' })  // thread-gold
Background:       Color('#FDF8EC')  // ivory
Wireframe:        MeshBasicMaterial({ color: '#8B2E35', wireframe: true })  // wine
```

### 3D Lighting Setup

```
Ambient:     AmbientLight(0xFDF8EC, 0.4)     // Warm ivory fill
Key:         DirectionalLight(0xF1E194, 0.8)  // Gold key light
Rim:         PointLight(0x5B0E14, 0.6)        // Burgundy rim
Environment: HDRI or preset 'studio'           // Subtle reflections
```

### Performance Rules

1. **Lazy Load All 3D** — Use `dynamic(() => import(...), { ssr: false })`
2. **Device Detection** — Skip WebGL on mobile/low-end devices, show 2D fallback
3. **Max Triangle Count** — Keep scenes under 10K triangles
4. **Texture Size** — Max 512×512 for any texture
5. **Dispose on Unmount** — Proper Three.js cleanup in useEffect return
6. **RequestAnimationFrame** — Use R3F's built-in render loop, not manual RAF
7. **Reduced Motion** — Show static image fallback when `prefers-reduced-motion: reduce`

---

## Product Display Rules (4 Products Only)

### Master Rule: NEVER show empty/blank product boxes

| Section | Current Behavior | New Behavior |
|---------|-----------------|-------------|
| **NewArrivals** | `.slice(0, 8)` = 8 products | `.slice(0, 4)` = 4 products, single row |
| **TheEdit** | `.slice(0, 8)` horizontal scroll | `.slice(0, 4)`, 4 items in scroll |
| **PremiumWomens** | 2 hardcoded products | Keep as-is (2 products, 2-col grid) |
| **PremiumMens** | 2 hardcoded products | Keep as-is (2 products, 2-col grid) |
| **Shop Page** | Up to 109 products | Show all 4, center in 4-col or 2×2 grid |
| **Related Products** | 4 products | 3 products (exclude current), 3-col grid |
| **Search Results** | Up to 8 | Max 4, dynamic grid |
| **FeaturedCollections** | Shows collections (not products) | Keep as-is |
| **Complete the Look** | NEW | 3 products (exclude current), 3-col |
| **Recently Viewed** | NEW | Up to 4, horizontal scroll |

### Grid Adaptation Logic

```typescript
function getGridCols(count: number): string {
  if (count >= 4) return 'grid-cols-2 md:grid-cols-4'
  if (count === 3) return 'grid-cols-1 md:grid-cols-3'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 max-w-md mx-auto'
}
```

### Changes Required

**Files to modify for product count fix**:

1. `src/components/home/NewArrivals.tsx`
   - Change `.slice(0, 8)` → use smart slice based on actual product count
   - Update grid to responsive 4-col / 2×2

2. `src/components/home/TheEdit.tsx`
   - Change `.slice(0, 8)` → smart slice
   - Adjust horizontal scroll for fewer items

3. `src/components/product/ProductGrid.tsx`
   - Add dynamic column calculation based on children count

4. `src/app/shop/page.tsx`
   - Center products when count < grid columns

5. `src/app/product/[slug]/page.tsx`
   - Related products: `getRelatedProducts(handle, 3)` instead of 4

6. `src/components/layout/SearchOverlay.tsx`
   - Results limited to actual matches, no fixed grid assumption

---

## Implementation Order (Recommended)

```
Week 1-2:  Phase 0 (Foundation + 3D setup + Product display fix)
Week 2-3:  1.1 Auth System + 1.6 Coupon System
Week 3-4:  1.3 Checkout Flow + 1.2 Order Tracking
Week 4-5:  1.4 Loyalty Program + 1.5 Returns Portal
Week 5-6:  2.1 Mega Menu + 2.2 Quick Add Modal + 2.3 Color Swatches
Week 6-7:  2.4 Predictive Search + 2.5 Size Guide + 2.6 Complete the Look
Week 7-8:  3.1-3.7 All Nice-to-Have features
Week 8-9:  Polish, Testing, Performance Optimization
```

---

## Verification Plan

After each phase:
1. `npm run build` — Ensure no TypeScript/build errors
2. `npm run dev` — Visual test all new components
3. Test on mobile viewport (390px) — Ensure responsive
4. Test with 4 products — Verify no blank boxes anywhere
5. Test with `prefers-reduced-motion` — Verify 3D fallbacks
6. Lighthouse audit — Performance score > 85
7. Keyboard navigation test — All new modals/forms accessible

---

## Files Summary

### New Files (Total: ~45 new files)

**Components** (~30):
- `src/components/3d/SceneWrapper.tsx`
- `src/components/3d/KnotModel.tsx`
- `src/components/3d/ThreadJourney.tsx`
- `src/components/3d/OutfitScene.tsx`
- `src/components/3d/LoyaltyKnot.tsx`
- `src/components/3d/NewsletterKnot.tsx`
- `src/components/auth/AuthModal.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`
- `src/components/account/OrderTimeline.tsx`
- `src/components/account/OrderCard.tsx`
- `src/components/checkout/CheckoutStepper.tsx`
- `src/components/checkout/ShippingForm.tsx`
- `src/components/checkout/PaymentForm.tsx`
- `src/components/checkout/OrderReview.tsx`
- `src/components/checkout/OrderConfirmation.tsx`
- `src/components/checkout/CouponInput.tsx`
- `src/components/loyalty/RewardsCard.tsx`
- `src/components/loyalty/TierBadge.tsx`
- `src/components/loyalty/PointsHistory.tsx`
- `src/components/loyalty/RewardsMeter.tsx`
- `src/components/returns/ReturnStepper.tsx`
- `src/components/returns/ReturnReasonSelector.tsx`
- `src/components/returns/ReturnStatusCard.tsx`
- `src/components/product/QuickAddModal.tsx`
- `src/components/product/SizeGuide.tsx`
- `src/components/product/SizeGuideModal.tsx`
- `src/components/product/CompleteTheLook.tsx`
- `src/components/product/RecentlyViewed.tsx`
- `src/components/product/BackInStockForm.tsx`
- `src/components/product/MemberPrice.tsx`
- `src/components/wishlist/WishlistShareModal.tsx`
- `src/components/wishlist/WishlistCard.tsx`
- `src/components/marketing/WelcomePopup.tsx`
- `src/components/support/ChatWidget.tsx`
- `src/components/support/ChatBubble.tsx`
- `src/components/support/ChatMessage.tsx`
- `src/components/ui/DiscountBadge.tsx`
- `src/components/ui/MemberBadge.tsx`
- `src/components/ui/NotifyBadge.tsx`
- `src/components/layout/MegaMenu.tsx`
- `src/components/layout/MegaMenuPanel.tsx`
- `src/components/analytics/AnalyticsProvider.tsx`

**Stores** (~4):
- `src/stores/auth-store.ts`
- `src/stores/checkout-store.ts`
- `src/stores/loyalty-store.ts`
- `src/stores/chat-store.ts`
- `src/stores/recently-viewed-store.ts`

**Pages** (~8):
- `src/app/account/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/account/orders/[id]/page.tsx`
- `src/app/account/wishlist/page.tsx`
- `src/app/account/rewards/page.tsx`
- `src/app/account/returns/page.tsx`
- `src/app/account/returns/new/page.tsx`
- `src/app/checkout/page.tsx`

**Data** (~4):
- `src/data/orders.json`
- `src/data/coupons.json`
- `src/data/size-guide.json`
- `src/lib/smart-grid.ts`
- `src/lib/analytics.ts`

### Files to Modify (~15):
- `package.json` (add Three.js dependencies)
- `src/types/index.ts` (add new types)
- `src/components/layout/Header.tsx` (mega menu, auth icon)
- `src/components/layout/ClientProviders.tsx` (new providers)
- `src/components/layout/CartDrawer.tsx` (coupon input)
- `src/components/layout/SearchOverlay.tsx` (predictive search)
- `src/components/product/ProductCard.tsx` (swatches, quick add, member price)
- `src/components/product/ProductGrid.tsx` (smart grid)
- `src/components/home/NewArrivals.tsx` (product count fix)
- `src/components/home/TheEdit.tsx` (product count fix)
- `src/components/home/Newsletter.tsx` (incentive)
- `src/stores/cart-store.ts` (coupon logic)
- `src/stores/wishlist-store.ts` (sharing)
- `src/app/product/[slug]/page.tsx` (size guide, complete look, member price)
- `src/app/shop/page.tsx` (recently viewed, grid fix)
- `src/app/cart/page.tsx` (coupon section)
- `src/app/layout.tsx` (analytics provider)
