# Snug&Knot - Premium Fashion E-Commerce

A world-class, award-winning inspired e-commerce website for a premium fashion brand. Built with modern web technologies and designed for performance, accessibility, and stunning animations.

## 🚀 Features

- **10 Pages**: Complete e-commerce experience including homepage, shop, product details, collections, lookbook, cart, and more
- **105 Products**: Full product catalog across 5 categories (tops, bottoms, dresses, outerwear, accessories)
- **Advanced Animations**: GSAP ScrollTrigger, Lenis smooth scroll, Framer Motion page transitions
- **State Management**: Zustand with persistence for cart and wishlist
- **Fully Responsive**: Optimized for all devices from 390px to 1920px+
- **Accessibility**: WCAG compliant with skip links, ARIA labels, and reduced motion support
- **SEO Optimized**: Complete metadata, sitemap, robots.txt, and Open Graph tags
- **Type-Safe**: Built with TypeScript in strict mode
- **Shopify-Ready**: Data structure mirrors Shopify Storefront API for easy migration

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS v4
- **Animations**:
  - GSAP 3.14 with ScrollTrigger
  - Lenis 1.3 smooth scroll
  - Framer Motion 12
- **State**: Zustand 5 with persistence
- **Fonts**: DM Serif Display, Inter, JetBrains Mono

## 📁 Project Structure

```
SnugAndKnot/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── shop/              # Shop and category pages
│   │   ├── product/[slug]/    # Product detail pages
│   │   ├── collections/[slug]/ # Collection pages
│   │   ├── about/             # About page
│   │   ├── cart/              # Cart page
│   │   ├── lookbook/          # Lookbook page
│   │   ├── search/            # Search page
│   │   └── contact/           # Contact page
│   ├── components/
│   │   ├── animation/         # Animation components
│   │   ├── layout/            # Layout components
│   │   ├── product/           # Product components
│   │   ├── home/              # Homepage sections
│   │   └── ui/                # UI primitives
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── lib/                   # Utilities and data access
│   ├── types/                 # TypeScript types
│   └── data/                  # JSON data files
└── public/
    └── images/                # Product and brand images
```

## 🎨 Design System

### Color Palette (Warm & Cozy)
- **Background**: #FDF6EE (cream)
- **Card/Section**: #F5EDE3 (cream dark)
- **Text**: #6B5B4E (walnut) to #2C2420 (charcoal)
- **CTA**: #C4795A (terracotta)
- **Accent**: #8B9E84 (sage green)

### Typography
- **Headings**: DM Serif Display (serif)
- **Body**: Inter (sans-serif)
- **Prices**: JetBrains Mono (monospace)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd SnugAndKnot

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the site.

## 📦 Key Components

### Animation Components
- **LenisProvider**: Smooth scroll wrapper
- **TextReveal**: Word-by-word text animations
- **ImageReveal**: Clip-path image reveals
- **ParallaxImage**: Scroll-based parallax
- **Marquee**: Infinite horizontal scroll
- **HorizontalScroll**: Pinned horizontal scroll sections
- **CustomCursor**: Desktop-only custom cursor

### Layout Components
- **Header**: Fixed header with mega-menu and mobile overlay
- **Footer**: 4-column footer with brand info
- **Preloader**: SVG logo animation on first visit
- **CartDrawer**: Slide-over cart with animations
- **SearchOverlay**: Full-screen search with debounced results
- **ToastContainer**: Bottom-right notifications

### Product Components
- **ProductCard**: Hover image swap, quick add, wishlist toggle
- **ProductGrid**: Animated grid with Framer Motion layout

## 🎯 Pages Overview

1. **Homepage** (`/`)
   - Hero with split layout
   - Brand values marquee
   - Category grid (asymmetric)
   - Horizontal scroll "The Edit"
   - Brand story teaser
   - New arrivals grid
   - Social/Instagram strip
   - Newsletter signup

2. **Shop** (`/shop`)
   - Filterable product grid (color, size, sort)
   - 105 products with real-time filtering

3. **Category Pages** (`/shop/[category]`)
   - Category-specific product grids
   - 5 categories supported

4. **Product Detail** (`/product/[slug]`)
   - Image gallery with thumbnails
   - Size and color pickers
   - Add to cart with quantity
   - Reviews section
   - Related products

5. **Collections** (`/collections/[slug]`)
   - Editorial magazine-style layouts
   - 8 curated collections

6. **Lookbook** (`/lookbook`)
   - Scroll-driven editorial spreads
   - 5 seasonal collections

7. **About** (`/about`)
   - Brand story with animations
   - Animated stat counters
   - Values grid
   - Timeline

8. **Cart** (`/cart`)
   - Full cart management
   - Quantity updates
   - Order summary

9. **Search** (`/search`)
   - Real-time debounced search
   - Instant results

10. **Contact** (`/contact`)
    - Contact form
    - Store information

## 🔧 Data Structure

All data structures mirror the Shopify Storefront API for easy future migration:

- **products.json**: 105 products with variants, images, pricing
- **categories.json**: Category metadata
- **collections.json**: 8 curated collections
- **reviews.json**: 60 product reviews
- **lookbook.json**: 5 editorial spreads
- **site-config.json**: Brand info and social links

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Skip to main content link
- Full keyboard navigation
- ARIA labels on interactive elements
- Reduced motion support throughout
- Semantic HTML5 structure

## 🚀 Performance

- Static generation where possible
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Minimized JavaScript bundles
- Tree-shaking enabled

## 🔄 Shopify Migration Path

To connect to Shopify later:
1. Replace JSON data access with Shopify Storefront API GraphQL queries
2. Swap Zustand cart with Shopify Cart API
3. Add checkout redirect
4. All UI, animations, and styling remain unchanged

## 📝 License

This is a demonstration project.

## 🙏 Credits

Design inspired by Awwwards SOTD-winning websites:
- Lenis smooth scroll
- GSAP ScrollTrigger animations
- Modern e-commerce best practices
# snugAndknot
