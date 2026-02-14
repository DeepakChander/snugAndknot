import { MetadataRoute } from 'next'
import { getAllProducts, getAllCollections, getAllCategories } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://snugandknot.com'
  const products = getAllProducts()
  const collections = getAllCollections()
  const categories = getAllCategories()

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lookbook`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/shop/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.handle}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const collectionPages = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...productPages, ...collectionPages]
}
