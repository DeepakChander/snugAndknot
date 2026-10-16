import StoreShell from '@/components/chrome/StoreShell'
import Analytics from '@/components/layout/Analytics'
import type { NavData, PublicSettings } from '@/components/providers/SettingsProvider'
import { getCategories, getCollections, getProducts, getStoreSettings } from '@/server/catalog'
import { currencies } from '@/lib/currency'
import type { CommerceSettings } from '@/types/commerce'

/**
 * Pages are pre-rendered in the base currency. For a shopper whose currency is another one (their
 * choice, or their country's, both in cookies), this hides prices until the page has switched them, so
 * they never see the wrong currency first. Nothing is emitted while the shop has a single currency.
 */
function CurrencyBootScript({ commerce }: { commerce: CommerceSettings }) {
  const all = currencies(commerce)
  if (all.length < 2) return null
  const base = all[0].code
  const extra = all.slice(1).map((c) => ({ code: c.code, countries: c.countries }))
  const js = `(function(){try{var c=document.cookie,m=function(n){var r=c.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return r?r[1]:''};var x=${JSON.stringify(extra).replace(/</g, '\\u003c')},ch=m('sk_currency'),co=m('sk_country'),cur='${base}';for(var i=0;i<x.length;i++){if(x[i].code===ch){cur=ch;break}}if(cur==='${base}'&&ch!=='${base}'&&co){for(var j=0;j<x.length;j++){if(x[j].countries.indexOf(co)>-1){cur=x[j].code;break}}}if(cur!=='${base}')document.documentElement.classList.add('sk-currency-pending')}catch(e){}})()`
  // eslint-disable-next-line react/no-danger -- fixed code; the only data are currency and country codes, which the settings schema limits to A–Z (and `<` is escaped in them anyway)
  return <script dangerouslySetInnerHTML={{ __html: js }} />
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, collections, categories, products] = await Promise.all([
    getStoreSettings(),
    getCollections(),
    getCategories(),
    getProducts({ sort: 'featured' }),
  ])

  const publicSettings: PublicSettings = {
    // No street address is published (the shop is online only); checkout keeps the country as its default.
    store: { ...settings.store, address: { street: '', city: '', state: '', zip: '', country: settings.store.address.country } },
    commerce: settings.commerce,
    announcement: settings.announcement,
    homepage: settings.homepage,
    reviews: settings.reviews,
  }

  const department = (g: 'men' | 'women' | 'kids') => {
    const list = products.filter((p) => p.gender === g || (g !== 'kids' && p.gender === 'unisex'))
    return { count: list.length, image: list.find((p) => p.images[0])?.images[0].src ?? '' }
  }

  const nav: NavData = {
    collections: collections.map(({ handle, title, subtitle, image }) => ({ handle, title, subtitle, image })),
    categories: categories.map(({ slug, title, image, department, group, showInMenu }) => ({ slug, title, image, department, group, showInMenu })),
    spotlight: products.slice(0, 4).map(({ handle, title, price, compareAtPrice, prices, images, productType }) => ({ handle, title, price, compareAtPrice, prices, images: images.slice(0, 1), productType })),
    departments: { men: department('men'), women: department('women'), kids: department('kids') },
  }

  return (
    <>
      <CurrencyBootScript commerce={settings.commerce} />
      <StoreShell settings={publicSettings} nav={nav}>
        {children}
      </StoreShell>
      <Analytics />
    </>
  )
}
