import mensPremiumData from '@/data/mens-premium-products.json'
import womensPremiumData from '@/data/womens-premium-products.json'
import categoriesData from '@/data/categories.json'
import collectionsData from '@/data/collections.json'
import reviewsData from '@/data/reviews.json'
import lookbookData from '@/data/lookbook.json'
import siteConfigData from '@/data/site-config.json'
import type { Product, Category, Collection, Review, LookbookSpread, SiteConfig, CategorySlug, SortOption } from '@/types'

// Only real premium products — no placeholders
const products = [
  ...(mensPremiumData as Product[]),
  ...(womensPremiumData as Product[]),
]
const categories = categoriesData as Category[]
const collections = collectionsData as Collection[]
const reviews = reviewsData as Review[]
const lookbook = lookbookData as LookbookSpread[]
const siteConfig = siteConfigData as SiteConfig

// Products
export function getAllProducts(): Product[] {
  return products
}

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle)
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category)
}

export function getProductsByGender(gender: 'men' | 'women' | 'kids'): Product[] {
  return products.filter((p) => p.gender === gender)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.new)
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.bestseller)
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      p.productType.toLowerCase().includes(q)
  )
}

export function filterProducts(options: {
  category?: CategorySlug
  colors?: string[]
  sizes?: string[]
  priceRange?: [number, number]
  sort?: SortOption
  search?: string
}): Product[] {
  let result = [...products]

  if (options.category) {
    result = result.filter((p) => p.category === options.category)
  }

  if (options.colors && options.colors.length > 0) {
    result = result.filter((p) => p.colors.some((c) => options.colors!.includes(c)))
  }

  if (options.sizes && options.sizes.length > 0) {
    result = result.filter((p) => p.sizes.some((s) => options.sizes!.includes(s)))
  }

  if (options.priceRange) {
    const [min, max] = options.priceRange
    result = result.filter((p) => p.price >= min && p.price <= max)
  }

  if (options.search) {
    const q = options.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  // Sort
  switch (options.sort) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'best-selling':
      result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0))
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'featured':
    default:
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      break
  }

  return result
}

export function getRelatedProducts(handle: string, limit = 4): Product[] {
  const product = getProductByHandle(handle)
  if (!product) return []
  return products
    .filter((p) => p.handle !== handle && p.category === product.category)
    .slice(0, limit)
}

// Get all unique colors across products
export function getAllColors(): string[] {
  const colors = new Set<string>()
  products.forEach((p) => p.colors.forEach((c) => colors.add(c)))
  return Array.from(colors).sort()
}

// Get all unique sizes
export function getAllSizes(): string[] {
  return ['XS', 'S', 'M', 'L', 'XL', 'One Size']
}

// Price range
export function getPriceRange(): [number, number] {
  const prices = products.map((p) => p.price)
  return [Math.min(...prices), Math.max(...prices)]
}

// Categories
export function getAllCategories(): Category[] {
  return categories
}

export function getCategoryBySlug(slug: CategorySlug): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

// Collections
export function getAllCollections(): Collection[] {
  return collections
}

export function getCollectionByHandle(handle: string): Collection | undefined {
  return collections.find((c) => c.handle === handle)
}

export function getCollectionProducts(handle: string): Product[] {
  const collection = getCollectionByHandle(handle)
  if (!collection) return []
  return collection.products
    .map((h) => getProductByHandle(h))
    .filter((p): p is Product => p !== undefined)
}

export function getFeaturedCollections(): Collection[] {
  return collections.filter((c) => c.featured)
}

// Reviews
export function getProductReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId)
}

export function getAverageRating(productId: string): number {
  const productReviews = getProductReviews(productId)
  if (productReviews.length === 0) return 0
  return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
}

// Lookbook
export function getAllLookbookSpreads(): LookbookSpread[] {
  return lookbook
}

// Site config
export function getSiteConfig(): SiteConfig {
  return siteConfig
}
