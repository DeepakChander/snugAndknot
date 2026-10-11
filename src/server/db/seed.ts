import 'server-only'
import type { Queryable } from './client'
import { DEFAULT_SETTINGS } from '@/lib/settings-defaults'
import type { ColorSwatch, ProductDetails, ProductImage } from '@/types/commerce'

interface SeedVariant {
  id: string
  sku: string
  size: string
  inventory: number
}

interface SeedProduct {
  id: string
  handle: string
  title: string
  description: string
  details: ProductDetails
  productType: string
  gender: 'men' | 'women'
  category: string
  tags: string[]
  price: number
  compareAtPrice: number
  images: ProductImage[]
  color: ColorSwatch
  variants: SeedVariant[]
  featured: boolean
  isNew: boolean
  bestseller: boolean
  createdAt: string
}

/**
 * The real Snug&Knot catalogue (the four premium pieces with photography).
 * Ratings are NOT seeded — they are computed from customer reviews only.
 */
const PRODUCTS: SeedProduct[] = [
  {
    id: 'men-black-red-contrast-tee',
    handle: 'black-red-contrast-knit-tee',
    title: 'Noir & Crimson Contrast Knit Tee',
    description:
      "Command attention without saying a word. Our Noir & Crimson Contrast Knit Tee is engineered for the man who refuses to blend in. The jet-black body delivers a clean, powerful silhouette, while the bold crimson shoulder panels and ribbed neckline inject a confident edge that elevates this far beyond your ordinary tee. Crafted from our signature superfine merino-cotton blend, this knit tee drapes with a refined weight that feels effortlessly premium against the skin. The precision-cut contrast panelling draws the eye across the shoulders, creating a naturally broader, more athletic frame. Whether you're heading to a rooftop dinner or a weekend gallery visit, this is the piece that bridges the gap between casual comfort and understated sophistication.",
    details: {
      fabric: 'Superfine merino-cotton blend',
      fit: 'Athletic fit with ribbed crew neckline',
      care: 'Hand wash cold or gentle machine cycle; dry flat.',
      features: ['Crimson contrast shoulder panels', 'Ribbed neckline', 'Precision-cut panelling', 'Refined drape weight'],
    },
    productType: 'Knit Tee',
    gender: 'men',
    category: 'tops',
    tags: ['men', 'knitwear', 'tee', 'premium', 'contrast', 'black', 'red', 'athletic'],
    price: 129,
    compareAtPrice: 179,
    images: [
      { src: '/images/products/men/black-red-contrast-tee-1.jpg', alt: 'Man wearing the black and red contrast knit tee — front view', width: 1536, height: 2573 },
      { src: '/images/products/men/black-red-contrast-tee-2.jpg', alt: 'Black and red contrast knit tee — detail view', width: 768, height: 1253 },
      { src: '/images/products/men/black-red-contrast-tee-3.jpg', alt: 'Black and red contrast knit tee — lifestyle view', width: 768, height: 1242 },
    ],
    color: { name: 'Black/Red', hex: '#141112' },
    variants: ['S', 'M', 'L', 'XL', 'XXL'].map((size) => ({
      id: `noir-crimson-${size.toLowerCase()}`,
      sku: `SNK-MEN-NRC-${size}`,
      size,
      inventory: 24,
    })),
    featured: true,
    isNew: true,
    bestseller: false,
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'men-navy-tan-colorblock-tee',
    handle: 'navy-tan-colorblock-knit-tee',
    title: 'Dusk & Sand Colorblock Knit Tee',
    description:
      "Where modern minimalism meets artisanal warmth. Our Dusk & Sand Colorblock Knit Tee pairs a deep midnight navy with rich sand tones in a striking vertical panel design that's as considered as it is effortless. Every stitch is intentional — the tonal interplay between the two fabrics creates a visual depth that catches light differently as you move, making this far more than a simple colour-blocked piece. Knitted from a breathable long-staple cotton with a touch of silk for subtle sheen, it sits beautifully untucked over tailored trousers or dressed down with your favourite denim. This is slow fashion at its finest: a piece built to outlast trends and grow more characterful with every wear.",
    details: {
      fabric: 'Long-staple cotton with a touch of silk',
      fit: 'Relaxed fit, designed to be worn untucked',
      care: 'Gentle machine wash cold; reshape and dry flat.',
      features: ['Vertical navy and sand panels', 'Subtle silk sheen', 'Breathable knit', 'Ribbed crew neckline'],
    },
    productType: 'Knit Tee',
    gender: 'men',
    category: 'tops',
    tags: ['men', 'knitwear', 'tee', 'premium', 'colorblock', 'navy', 'tan', 'minimal'],
    price: 139,
    compareAtPrice: 189,
    images: [
      { src: '/images/products/men/navy-tan-colorblock-tee-1.jpg', alt: 'Man wearing the navy and tan colorblock knit tee — front view', width: 1520, height: 2368 },
      { src: '/images/products/men/navy-tan-colorblock-tee-2.jpg', alt: 'Navy and tan colorblock knit tee — detail view', width: 700, height: 1152 },
    ],
    color: { name: 'Navy/Tan', hex: '#1d2236' },
    variants: ['S', 'M', 'L', 'XL', 'XXL'].map((size) => ({
      id: `dusk-sand-${size.toLowerCase()}`,
      sku: `SNK-MEN-DSC-${size}`,
      size,
      inventory: 24,
    })),
    featured: true,
    isNew: true,
    bestseller: true,
    createdAt: '2024-11-25T10:00:00Z',
  },
  {
    id: 'women-ivory-cable-cardigan',
    handle: 'ivory-cable-knit-cardigan',
    title: 'Ivory Cable Knit Cardigan',
    description:
      "Embrace timeless elegance with our Ivory Cable Knit Cardigan, a masterpiece of artisanal craftsmanship. Hand-finished with intricate cable patterns that whisper tales of heritage knitting techniques, this cardigan is more than just a layer — it's an heirloom in the making. The sumptuous cream-colored yarn feels like a gentle embrace against your skin, while the carefully selected wooden buttons add an organic touch that speaks to our commitment to sustainable luxury. Perfect for crisp autumn mornings or cozy evenings by the fire, this versatile piece transitions effortlessly from casual weekends to polished office settings.",
    details: {
      fabric: '100% Premium Merino Wool',
      fit: 'Relaxed fit with classic V-neckline',
      care: 'Hand wash cold, lay flat to dry. Dry clean for best results.',
      sustainability: 'Made with certified organic wool from family-owned farms',
      features: [
        'Intricate cable knit pattern',
        'Natural wooden button closure',
        'Ribbed cuffs and hem for shape retention',
        'Soft, breathable merino wool',
        'Ethically sourced materials',
      ],
    },
    productType: 'Cardigan',
    gender: 'women',
    category: 'cardigans',
    tags: ['women', 'knitwear', 'cardigan', 'premium', 'cable-knit', 'autumn', 'winter', 'sustainable'],
    price: 189,
    compareAtPrice: 249,
    images: [
      { src: '/images/products/women/ivory-cable-cardigan-1.jpg', alt: 'Woman wearing the ivory cable knit cardigan — front view', width: 1457, height: 2400 },
      { src: '/images/products/women/ivory-cable-cardigan-2.jpg', alt: 'Ivory cable knit cardigan — detail view', width: 864, height: 1064 },
      { src: '/images/products/women/ivory-cable-cardigan-3.jpg', alt: 'Ivory cable knit cardigan — lifestyle view', width: 448, height: 768 },
    ],
    color: { name: 'Ivory', hex: '#efe7d6' },
    variants: ['XS', 'S', 'M', 'L', 'XL'].map((size) => ({
      id: `ivory-cable-${size.toLowerCase()}`,
      sku: `SNK-WOM-IVC-${size}`,
      size,
      inventory: 18,
    })),
    featured: true,
    isNew: true,
    bestseller: false,
    createdAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'women-terracotta-textured-cardigan',
    handle: 'terracotta-textured-cardigan',
    title: 'Terracotta Textured Cardigan',
    description:
      'Discover the perfect fusion of warmth and sophistication in our Terracotta Textured Cardigan. This stunning piece captures the essence of autumn with its rich, earthy terracotta hue — a color that flatters every skin tone and pairs beautifully with your existing wardrobe. The subtle diamond-textured knit creates visual interest without overwhelming, while the premium cotton-blend yarn ensures breathability and comfort throughout the day. Featuring our signature wooden button detailing, this cardigan is designed for the modern woman who values quality craftsmanship and understated elegance.',
    details: {
      fabric: '70% Premium Cotton, 30% Cashmere Blend',
      fit: 'Classic fit with round neckline',
      care: 'Machine wash gentle cycle, cold water. Reshape and dry flat.',
      sustainability: 'Crafted using eco-friendly dyeing processes and sustainable cotton',
      features: [
        'Diamond-textured knit pattern',
        'Natural wooden button closure',
        'Soft cotton-cashmere blend',
        'Breathable and comfortable',
        'Versatile layering piece',
      ],
    },
    productType: 'Cardigan',
    gender: 'women',
    category: 'cardigans',
    tags: ['women', 'knitwear', 'cardigan', 'premium', 'terracotta', 'autumn', 'textured', 'sustainable'],
    price: 169,
    compareAtPrice: 229,
    images: [
      { src: '/images/products/women/terracotta-textured-cardigan-1.jpg', alt: 'Woman wearing the terracotta textured cardigan — front view', width: 1490, height: 2400 },
      { src: '/images/products/women/terracotta-textured-cardigan-2.jpg', alt: 'Terracotta textured cardigan — detail view', width: 864, height: 1084 },
      { src: '/images/products/women/terracotta-textured-cardigan-3.jpg', alt: 'Terracotta textured cardigan — lifestyle view', width: 727, height: 1184 },
    ],
    color: { name: 'Terracotta', hex: '#9c3b2e' },
    variants: ['XS', 'S', 'M', 'L', 'XL'].map((size) => ({
      id: `terracotta-${size.toLowerCase()}`,
      sku: `SNK-WOM-TTC-${size}`,
      size,
      inventory: 18,
    })),
    featured: true,
    isNew: true,
    bestseller: true,
    createdAt: '2024-11-10T10:00:00Z',
  },
]

const CATEGORIES = [
  {
    slug: 'tops',
    title: 'Knit Tops',
    description: 'Fine-gauge knit tees and tops — merino, cotton and silk blends with a refined drape.',
    image: '/images/products/men/navy-tan-colorblock-tee-1.jpg',
  },
  {
    slug: 'cardigans',
    title: 'Cardigans',
    description: 'Cable, texture and heritage stitches, finished with natural wooden buttons.',
    image: '/images/products/women/ivory-cable-cardigan-1.jpg',
  },
]

const COLLECTIONS = [
  {
    id: 'col-winter-warmth',
    handle: 'winter-warmth',
    title: 'Winter Warmth',
    subtitle: 'The cold-weather edit',
    description:
      'Cozy essentials to see you through the coldest months. Plush knits, sumptuous wools and layers made for firelight.',
    image: '/images/Collections-Hero/Winter.png',
    productIds: ['women-ivory-cable-cardigan', 'women-terracotta-textured-cardigan'],
  },
  {
    id: 'col-artisan',
    handle: 'the-artisan-edit',
    title: 'The Artisan Edit',
    subtitle: 'Hand-finished, slowly',
    description:
      'Pieces that carry the hand that made them — heritage stitches, natural buttons and yarns chosen one skein at a time.',
    image: "/images/collection-home/Artisan's.png",
    productIds: ['women-ivory-cable-cardigan', 'women-terracotta-textured-cardigan', 'men-navy-tan-colorblock-tee', 'men-black-red-contrast-tee'],
  },
  {
    id: 'col-essentials',
    handle: 'the-essentials-edit',
    title: 'The Essentials Edit',
    subtitle: 'Wear on repeat',
    description: "The building blocks of a timeless wardrobe — the pieces you'll reach for every day, season after season.",
    image: '/images/Collections-Hero/Essentials.png',
    productIds: ['men-navy-tan-colorblock-tee', 'men-black-red-contrast-tee', 'women-ivory-cable-cardigan'],
  },
  {
    id: 'col-coastal',
    handle: 'coastal-escape',
    title: 'Coastal Escape',
    subtitle: 'Salt air, soft layers',
    description: 'Sun-drenched days and salt-kissed evenings. Breathable knits made for the walk home along the shore.',
    image: '/images/Collections-Hero/Coastal.png',
    productIds: ['men-navy-tan-colorblock-tee', 'women-terracotta-textured-cardigan'],
  },
]

const COUPONS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minPurchase: 0, description: '10% off your first order', expiresAt: '2026-12-31' },
  { code: 'KNOTFREE', type: 'fixed', value: 15, minPurchase: 100, description: '$15 off orders over $100', expiresAt: '2026-12-31' },
  { code: 'SNUG20', type: 'percentage', value: 20, minPurchase: 150, description: '20% off orders over $150', expiresAt: '2026-06-30' },
]

export async function seedDatabase(q: Queryable) {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await q.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING',
      [key, JSON.stringify(value)]
    )
  }

  for (const [i, c] of CATEGORIES.entries()) {
    await q.query(
      `INSERT INTO categories (slug, title, description, image, position)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.title, c.description, c.image, i]
    )
  }

  for (const p of PRODUCTS) {
    await q.query(
      `INSERT INTO products (id, handle, title, description, details, vendor, product_type, gender, category,
         tags, price, compare_at_price, images, colors, sizes, featured, is_new, bestseller, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, 'Snug&Knot', $6, $7, $8, $9::text[], $10, $11, $12::jsonb, $13::jsonb,
         $14::text[], $15, $16, $17, 'active', $18, $18)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id, p.handle, p.title, p.description, JSON.stringify(p.details), p.productType, p.gender, p.category,
        p.tags, p.price, p.compareAtPrice, JSON.stringify(p.images), JSON.stringify([p.color]),
        p.variants.map((v) => v.size), p.featured, p.isNew, p.bestseller, p.createdAt,
      ]
    )
    for (const [i, v] of p.variants.entries()) {
      await q.query(
        `INSERT INTO variants (id, product_id, title, sku, size, color, price, compare_at_price, inventory, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
        [v.id, p.id, `${v.size} / ${p.color.name}`, v.sku, v.size, p.color.name, p.price, p.compareAtPrice, v.inventory, i]
      )
    }
  }

  for (const [i, c] of COLLECTIONS.entries()) {
    await q.query(
      `INSERT INTO collections (id, handle, title, subtitle, description, image, product_ids, featured, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7::text[], true, $8) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.handle, c.title, c.subtitle, c.description, c.image, c.productIds, i]
    )
  }

  for (const c of COUPONS) {
    await q.query(
      `INSERT INTO coupons (code, type, value, min_purchase, description, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING`,
      [c.code, c.type, c.value, c.minPurchase, c.description, c.expiresAt]
    )
  }
}
