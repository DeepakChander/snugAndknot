import StoreShell from '@/components/chrome/StoreShell'
import Analytics from '@/components/layout/Analytics'
import type { NavData, PublicSettings } from '@/components/providers/SettingsProvider'
import { getCategories, getCollections, getProducts, getStoreSettings } from '@/server/catalog'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, collections, categories, products] = await Promise.all([
    getStoreSettings(),
    getCollections(),
    getCategories(),
    getProducts({ sort: 'featured' }),
  ])

  const publicSettings: PublicSettings = {
    store: settings.store,
    commerce: settings.commerce,
    announcement: settings.announcement,
    homepage: settings.homepage,
    reviews: settings.reviews,
  }

  const count = (g: 'men' | 'women' | 'kids') =>
    products.filter((p) => p.gender === g || (g !== 'kids' && p.gender === 'unisex')).length

  const nav: NavData = {
    collections: collections.map(({ handle, title, subtitle, image }) => ({ handle, title, subtitle, image })),
    categories: categories.map(({ slug, title, image }) => ({ slug, title, image })),
    spotlight: products.slice(0, 4).map(({ handle, title, price, images, productType }) => ({ handle, title, price, images: images.slice(0, 1), productType })),
    genders: { men: count('men'), women: count('women'), kids: count('kids') },
  }

  return (
    <>
      <StoreShell settings={publicSettings} nav={nav}>
        {children}
      </StoreShell>
      <Analytics />
    </>
  )
}
