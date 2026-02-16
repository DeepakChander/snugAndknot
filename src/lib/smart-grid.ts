import type { Product } from '@/types'

export interface GridConfig {
  columns: string
  maxItems: number
}

/**
 * Dynamically adjusts grid columns based on actual product count.
 * Ensures no blank product boxes ever appear.
 */
export function getSmartGridCols(count: number): string {
  if (count >= 4) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
  return 'grid-cols-1 max-w-md mx-auto'
}

/**
 * Returns the safe slice count — never more products than available.
 */
export function getSmartSliceCount(products: Product[], maxDesired: number): number {
  return Math.min(products.length, maxDesired)
}

/**
 * Safely slices products to fill the grid without blanks.
 */
export function smartSlice(products: Product[], maxDesired: number): Product[] {
  return products.slice(0, getSmartSliceCount(products, maxDesired))
}
