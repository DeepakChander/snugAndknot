'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useMoney } from '@/components/providers/SettingsProvider'
import { Badge, Btn, Card, Input, PageHeader, Select, STATUS_TONE, Textarea, Toggle, confirmAction, useMutate } from './ui'
import { MediaLibrary, uploadImage } from './ImagePicker'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/format'
import type { Category, ColorSwatch, Gender, Product, ProductImage, ProductStatus } from '@/types/commerce'

type VariantRow = { id?: string; title?: string; sku: string; size: string; color: string; price: string; compareAtPrice: string; inventory: string }

interface Draft {
  title: string
  handle: string
  description: string
  vendor: string
  productType: string
  gender: Gender
  category: string
  tags: string
  price: string
  compareAtPrice: string
  images: ProductImage[]
  colors: ColorSwatch[]
  fabric: string
  fit: string
  care: string
  sustainability: string
  features: string
  featured: boolean
  isNew: boolean
  bestseller: boolean
  status: ProductStatus
  seoTitle: string
  seoDescription: string
  variants: VariantRow[]
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

function toDraft(p: Product | null): Draft {
  return {
    title: p?.title ?? '',
    handle: p?.handle ?? '',
    description: p?.description ?? '',
    vendor: p?.vendor ?? 'Snug&Knot',
    productType: p?.productType ?? '',
    gender: p?.gender ?? 'women',
    category: p?.category ?? '',
    tags: (p?.tags ?? []).join(', '),
    price: p ? String(p.price) : '',
    compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : '',
    images: p?.images ?? [],
    colors: p?.colors ?? [],
    fabric: p?.details.fabric ?? '',
    fit: p?.details.fit ?? '',
    care: p?.details.care ?? '',
    sustainability: p?.details.sustainability ?? '',
    features: (p?.details.features ?? []).join('\n'),
    featured: p?.featured ?? false,
    isNew: p?.isNew ?? true,
    bestseller: p?.bestseller ?? false,
    status: p?.status ?? 'draft',
    seoTitle: p?.seoTitle ?? '',
    seoDescription: p?.seoDescription ?? '',
    variants: (p?.variants ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      size: v.size ?? '',
      color: v.color ?? '',
      price: String(v.price),
      compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : '',
      inventory: String(v.inventory),
    })),
  }
}

export default function ProductEditor({ product, categories }: { product: Product | null; categories: Category[] }) {
  const router = useRouter()
  const money = useMoney()
  const addToast = useUIStore((s) => s.addToast)
  const { run, busy, fieldErrors } = useMutate()
  const [d, setD] = useState<Draft>(() => toDraft(product))
  const [handleTouched, setHandleTouched] = useState(!!product)
  const [library, setLibrary] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sizesInput, setSizesInput] = useState('XS, S, M, L, XL')
  const fileRef = useRef<HTMLInputElement>(null)
  const isNew = !product

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const err = (k: string) => fieldErrors[k]

  const totalStock = useMemo(() => d.variants.reduce((s, v) => s + (parseInt(v.inventory, 10) || 0), 0), [d.variants])

  function payload() {
    const num = (v: string) => (v.trim() === '' ? null : Number(v))
    return {
      handle: d.handle,
      title: d.title,
      description: d.description,
      details: {
        fabric: d.fabric || undefined,
        fit: d.fit || undefined,
        care: d.care || undefined,
        sustainability: d.sustainability || undefined,
        features: d.features
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      vendor: d.vendor,
      productType: d.productType,
      gender: d.gender,
      category: d.category,
      tags: d.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      price: Number(d.price),
      compareAtPrice: num(d.compareAtPrice),
      images: d.images.filter((i) => i.src.trim()),
      colors: d.colors.filter((c) => c.name.trim()),
      featured: d.featured,
      isNew: d.isNew,
      bestseller: d.bestseller,
      status: d.status,
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      variants: d.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        size: v.size || null,
        color: v.color || null,
        price: v.price.trim() === '' ? Number(d.price) : Number(v.price),
        compareAtPrice: num(v.compareAtPrice) ?? num(d.compareAtPrice),
        inventory: parseInt(v.inventory, 10) || 0,
      })),
    }
  }

  async function save() {
    if (isNew) {
      const res = await run<{ product: Product }>('POST', '/api/admin/products', payload(), 'Product created.')
      if (res) router.replace(`/admin/products/${res.product.id}`)
    } else {
      const res = await run<{ product: Product }>('PUT', `/api/admin/products/${product.id}`, payload(), 'Changes saved — the storefront is updated.')
      if (res) setD(toDraft(res.product))
    }
  }

  async function remove() {
    if (!product || !confirmAction(`Delete “${product.title}”? This removes it, its variants and its reviews. Orders keep their history.`)) return
    const res = await run('DELETE', `/api/admin/products/${product.id}`, undefined, 'Product deleted.')
    if (res) router.push('/admin/products')
  }

  function generateVariants() {
    const sizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const colors = d.colors.length ? d.colors.map((c) => c.name) : ['']
    const base = (d.handle || slug(d.title) || 'item').toUpperCase().replace(/-/g, '').slice(0, 10)
    const rows: VariantRow[] = []
    for (const color of colors) {
      for (const size of sizes) {
        const existing = d.variants.find((v) => v.size === size && v.color === color)
        rows.push(
          existing ?? {
            sku: `SNK-${base}-${color ? color.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + '-' : ''}${size.replace(/\s+/g, '').toUpperCase()}`,
            size,
            color,
            price: '',
            compareAtPrice: '',
            inventory: '0',
          }
        )
      }
    }
    set('variants', rows)
  }

  const moveImage = (i: number, dir: -1 | 1) => {
    const imgs = [...d.images]
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    set('images', imgs)
  }

  return (
    <>
      <PageHeader
        back={
          <Link href="/admin/products" className="mb-2 inline-block text-xs text-stone hover:text-ink">
            ← Products
          </Link>
        }
        title={isNew ? 'New product' : d.title || 'Untitled'}
        description={isNew ? 'Fill in the details, add at least one variant, then save. New products start as drafts.' : <>Status <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge> · {totalStock} in stock across {d.variants.length} variant(s)</>}
        actions={
          <>
            {!isNew ? (
              <a href={`/product/${product.handle}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-full border border-ink/15 bg-white px-4 text-sm hover:border-ink/40">
                View on store ↗
              </a>
            ) : null}
            <Btn onClick={save} loading={busy}>
              {isNew ? 'Create product' : 'Save changes'}
            </Btn>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <div className="grid gap-4">
              <Input
                label="Title"
                value={d.title}
                error={err('title')}
                onChange={(e) => {
                  const title = e.target.value
                  setD((x) => ({ ...x, title, handle: handleTouched ? x.handle : slug(title) }))
                }}
              />
              <Input
                label="URL handle"
                prefix="/"
                value={d.handle}
                error={err('handle')}
                hint={`The address of the product page: /product/${d.handle || 'your-handle'}`}
                onChange={(e) => {
                  setHandleTouched(true)
                  set('handle', e.target.value.toLowerCase())
                }}
              />
              <Textarea label="Description" rows={7} value={d.description} error={err('description')} onChange={(e) => set('description', e.target.value)} />
            </div>
          </Card>

          <Card
            title={`Images (${d.images.length})`}
            actions={
              <div className="flex gap-2">
                <Btn size="sm" variant="outline" loading={uploading} onClick={() => fileRef.current?.click()}>
                  Upload
                </Btn>
                <Btn size="sm" variant="outline" onClick={() => setLibrary(true)}>
                  From library
                </Btn>
                <Btn size="sm" variant="ghost" onClick={() => set('images', [...d.images, { src: '', alt: '' }])}>
                  Add URL
                </Btn>
              </div>
            }
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? [])
                e.target.value = ''
                if (!files.length) return
                setUploading(true)
                const added: ProductImage[] = []
                for (const f of files) {
                  try {
                    added.push({ src: await uploadImage(f), alt: d.title })
                  } catch (error) {
                    addToast(`${f.name}: ${error instanceof ApiError ? error.message : 'upload failed'}`, 'error')
                  }
                }
                setD((x) => ({ ...x, images: [...x.images, ...added] }))
                setUploading(false)
                if (added.length) addToast(`${added.length} image(s) uploaded — save to publish.`)
              }}
            />
            {d.images.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {d.images.map((img, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-ink/10 bg-white p-3">
                    <span className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-parchment">
                      {img.src ? <Image src={img.src} alt="" fill sizes="72px" className="object-cover" unoptimized={img.src.startsWith('/api/media/')} /> : null}
                      {i === 0 ? <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-ivory">Main</span> : null}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input value={img.src} onChange={(e) => set('images', d.images.map((x, j) => (j === i ? { ...x, src: e.target.value } : x)))} placeholder="Image URL" className="w-full rounded-lg border border-ink/15 px-2.5 py-1.5 font-mono text-[11px] outline-none focus:border-ink/50" />
                      <input value={img.alt} onChange={(e) => set('images', d.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Alt text (describe the photo)" className="w-full rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs outline-none focus:border-ink/50" />
                      <div className="flex gap-1">
                        <Btn size="sm" variant="ghost" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move earlier">
                          ↑
                        </Btn>
                        <Btn size="sm" variant="ghost" onClick={() => moveImage(i, 1)} disabled={i === d.images.length - 1} aria-label="Move later">
                          ↓
                        </Btn>
                        <Btn size="sm" variant="ghost" className="text-error" onClick={() => set('images', d.images.filter((_, j) => j !== i))}>
                          Remove
                        </Btn>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone">No images yet. The first image is used on product cards.</p>
            )}
            {err('images') ? <p className="mt-2 text-xs text-error">{err('images')}</p> : null}
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price" type="number" min={0} step="0.01" prefix="$" value={d.price} error={err('price')} onChange={(e) => set('price', e.target.value)} hint="Default price for variants without their own." />
              <Input label="Compare-at price (optional)" type="number" min={0} step="0.01" prefix="$" value={d.compareAtPrice} error={err('compareAtPrice')} onChange={(e) => set('compareAtPrice', e.target.value)} hint="Shown struck through when higher than the price." />
            </div>
          </Card>

          <Card title="Colours">
            <div className="space-y-2">
              {d.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={c.hex} onChange={(e) => set('colors', d.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-white p-1" aria-label="Swatch colour" />
                  <input value={c.name} onChange={(e) => set('colors', d.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Colour name, e.g. Ivory" className="h-10 min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink/50" />
                  <span className="hidden w-20 font-mono text-xs text-stone sm:inline">{c.hex}</span>
                  <Btn size="sm" variant="ghost" className="text-error" onClick={() => set('colors', d.colors.filter((_, j) => j !== i))}>
                    Remove
                  </Btn>
                </div>
              ))}
              <Btn size="sm" variant="outline" onClick={() => set('colors', [...d.colors, { name: '', hex: '#c9a35c' }])}>
                Add colour
              </Btn>
              {Object.keys(fieldErrors).some((k) => k.startsWith('colors')) ? <p className="text-xs text-error">{Object.entries(fieldErrors).find(([k]) => k.startsWith('colors'))?.[1]}</p> : null}
            </div>
          </Card>

          <Card
            title={`Variants & stock (${d.variants.length})`}
            actions={
              <div className="flex items-center gap-2">
                <input value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} className="h-8 w-40 rounded-full border border-ink/15 bg-white px-3 text-xs" aria-label="Sizes to generate" />
                <Btn size="sm" variant="outline" onClick={generateVariants}>
                  Generate sizes × colours
                </Btn>
              </div>
            }
            pad={false}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs text-stone">
                  <tr>
                    <th className="px-4 py-2 font-medium">SKU</th>
                    <th className="px-2 py-2 font-medium">Size</th>
                    <th className="px-2 py-2 font-medium">Colour</th>
                    <th className="px-2 py-2 font-medium">Price</th>
                    <th className="px-2 py-2 font-medium">Compare-at</th>
                    <th className="px-2 py-2 font-medium">Stock</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {d.variants.map((v, i) => {
                    const upd = (patch: Partial<VariantRow>) => set('variants', d.variants.map((x, j) => (j === i ? { ...x, ...patch } : x)))
                    const cell = 'h-9 w-full rounded-lg border border-ink/15 bg-white px-2 text-sm outline-none focus:border-ink/50'
                    return (
                      <tr key={v.id ?? `new-${i}`} className="border-t border-ink/5">
                        <td className="px-4 py-2">
                          <input value={v.sku} onChange={(e) => upd({ sku: e.target.value })} className={cn(cell, 'font-mono text-xs', fieldErrors[`variants.${i}.sku`] && 'border-error')} aria-label="SKU" />
                        </td>
                        <td className="px-2 py-2">
                          <input value={v.size} onChange={(e) => upd({ size: e.target.value })} className={cn(cell, 'w-20')} aria-label="Size" />
                        </td>
                        <td className="px-2 py-2">
                          <input value={v.color} list="variant-colours" onChange={(e) => upd({ color: e.target.value })} className={cn(cell, 'w-28')} aria-label="Colour" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} step="0.01" value={v.price} placeholder={d.price} onChange={(e) => upd({ price: e.target.value })} className={cn(cell, 'w-24')} aria-label="Price" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} step="0.01" value={v.compareAtPrice} placeholder={d.compareAtPrice} onChange={(e) => upd({ compareAtPrice: e.target.value })} className={cn(cell, 'w-24')} aria-label="Compare-at price" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} step={1} value={v.inventory} onChange={(e) => upd({ inventory: e.target.value })} className={cn(cell, 'w-20', (parseInt(v.inventory, 10) || 0) === 0 && 'border-error/40')} aria-label="Stock" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Btn size="sm" variant="ghost" className="text-error" onClick={() => set('variants', d.variants.filter((_, j) => j !== i))}>
                            Remove
                          </Btn>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <datalist id="variant-colours">
                {d.colors.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-4 py-3">
              <Btn size="sm" variant="outline" onClick={() => set('variants', [...d.variants, { sku: '', size: '', color: d.colors[0]?.name ?? '', price: '', compareAtPrice: '', inventory: '0' }])}>
                Add variant
              </Btn>
              <span className="text-xs text-stone">
                {totalStock} in stock · empty price uses {d.price ? money(Number(d.price)) : 'the product price'}
              </span>
            </div>
            {err('variants') ? <p className="px-4 pb-3 text-xs text-error">{err('variants')}</p> : null}
            {Object.entries(fieldErrors)
              .filter(([k]) => k.startsWith('variants.'))
              .slice(0, 3)
              .map(([k, m]) => (
                <p key={k} className="px-4 pb-2 text-xs text-error">
                  Variant {Number(k.split('.')[1]) + 1}: {m}
                </p>
              ))}
          </Card>

          <Card title="Fabric, fit & care">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Fabric" value={d.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="100% Merino Wool" />
              <Input label="Fit" value={d.fit} onChange={(e) => set('fit', e.target.value)} placeholder="Relaxed fit with V-neckline" />
              <Textarea label="Care" rows={2} wrapClassName="sm:col-span-2" value={d.care} onChange={(e) => set('care', e.target.value)} />
              <Textarea label="Sourcing / sustainability" rows={2} wrapClassName="sm:col-span-2" value={d.sustainability} onChange={(e) => set('sustainability', e.target.value)} />
              <Textarea label="Features (one per line)" rows={5} wrapClassName="sm:col-span-2" value={d.features} onChange={(e) => set('features', e.target.value)} />
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Status">
            <div className="space-y-4">
              <Select label="Visibility" value={d.status} onChange={(e) => set('status', e.target.value as ProductStatus)}>
                <option value="active">Active — on the storefront</option>
                <option value="draft">Draft — hidden</option>
                <option value="archived">Archived — hidden</option>
              </Select>
              <Toggle checked={d.featured} onChange={(v) => set('featured', v)} label="Featured" description="Sorted first and shown in the home page edit." />
              <Toggle checked={d.isNew} onChange={(v) => set('isNew', v)} label="New" description="Shows the “New” badge." />
              <Toggle checked={d.bestseller} onChange={(v) => set('bestseller', v)} label="Bestseller" />
            </div>
          </Card>
          <Card title="Organisation">
            <div className="space-y-4">
              <Select label="Department" value={d.gender} onChange={(e) => set('gender', e.target.value as Gender)}>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex (women & men)</option>
              </Select>
              <Select label="Category" value={d.category} onChange={(e) => set('category', e.target.value)} hint={<Link href="/admin/categories" className="underline">Manage categories</Link>}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
                {d.category && !categories.some((c) => c.slug === d.category) ? <option value={d.category}>{d.category} (missing)</option> : null}
              </Select>
              <Input label="Product type" value={d.productType} onChange={(e) => set('productType', e.target.value)} placeholder="Cardigan" />
              <Input label="Tags" value={d.tags} onChange={(e) => set('tags', e.target.value)} hint="Comma separated — used by search." />
              <Input label="Vendor" value={d.vendor} onChange={(e) => set('vendor', e.target.value)} />
            </div>
          </Card>
          <Card title="Search engines">
            <div className="space-y-4">
              <Input label="SEO title" value={d.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={d.title} hint={`${(d.seoTitle || d.title).length}/60`} />
              <Textarea label="SEO description" rows={3} value={d.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} placeholder={d.description.slice(0, 155)} hint={`${(d.seoDescription || d.description.slice(0, 155)).length}/155`} />
              <div className="rounded-xl bg-white p-3 text-xs ring-1 ring-ink/10">
                <p className="truncate text-[#1a0dab]">{d.seoTitle || d.title || 'Product title'}</p>
                <p className="truncate text-[#006621]">/product/{d.handle}</p>
                <p className="line-clamp-2 text-stone">{d.seoDescription || d.description.slice(0, 155)}</p>
              </div>
            </div>
          </Card>
          {!isNew ? (
            <Card title="Danger zone">
              <p className="mb-3 text-xs text-stone">To hide a product temporarily, set it to Draft instead.</p>
              <Btn variant="danger" onClick={remove} loading={busy}>
                Delete product
              </Btn>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-4 z-10 mt-8 flex justify-end">
        <Btn onClick={save} loading={busy} className="shadow-xl">
          {isNew ? 'Create product' : 'Save changes'}
        </Btn>
      </div>
      <MediaLibrary open={library} onClose={() => setLibrary(false)} onPick={(url) => set('images', [...d.images, { src: url, alt: d.title }])} />
    </>
  )
}
