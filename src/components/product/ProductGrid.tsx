'use client'

import ProductCard from './ProductCard'
import { getSmartGridCols } from '@/lib/smart-grid'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const count = products.length
  const maxCols = columns === 2 ? 2 : columns === 3 ? 3 : 4

  // Smart grid: adapt columns to actual product count so no blank boxes appear
  const gridCols =
    count < maxCols
      ? getSmartGridCols(count)
      : {
          2: 'grid-cols-2',
          3: 'grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        }[columns]

  return (
    <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} priority={i < 4} />
      ))}
    </div>
  )
}
