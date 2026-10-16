'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/format'
import { DEPARTMENT_TITLES, type Department } from '@/lib/categories'

export interface CategoryTile {
  slug: string
  href: string
  title: string
  badge: string
  image: string
  department: Department
}

/**
 * "Shop by category": a tab per department and its categories as photograph tiles, the name under
 * each. Fed by the categories marked "Show on home page" in the admin that have an image, in admin
 * order; a department with none has no tab, and the section is left out when no department has any.
 */
export default function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  const departments = (['women', 'men', 'kids'] as const).filter((d) => tiles.some((t) => t.department === d))
  const [dept, setDept] = useState<Department | undefined>(departments[0])
  if (!departments.length || !dept) return null
  const shown = tiles.filter((t) => t.department === dept)

  return (
    <section aria-labelledby="category-grid-title" className="bg-ivory py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-eyebrow text-stone">Find your fit</p>
            <h2 id="category-grid-title" className="mt-3 text-headline">
              Shop by <em>category</em>
            </h2>
          </div>
          {departments.length > 1 ? (
            <div role="tablist" aria-label="Department" className="flex gap-6">
              {departments.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  id={`category-tab-${d}`}
                  aria-selected={dept === d}
                  aria-controls="category-grid-panel"
                  onClick={() => setDept(d)}
                  className={cn(
                    'relative pb-1.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors',
                    dept === d ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink' : 'text-ink/50 hover:text-ink'
                  )}
                >
                  {DEPARTMENT_TITLES[d]}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <ul id="category-grid-panel" role="tabpanel" aria-labelledby={`category-tab-${dept}`} className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
          {shown.map((t) => (
            <li key={t.slug}>
              <Link href={t.href} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden bg-bone">
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                    unoptimized={t.image.startsWith('/api/media/')}
                  />
                  {t.badge ? <span className="absolute left-2.5 top-2.5 bg-ivory px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink">{t.badge}</span> : null}
                </span>
                <span className="mt-3 block text-[0.86rem] font-medium group-hover:underline group-hover:underline-offset-4">{t.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href={`/shop/${dept}`} className="inline-block border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
            Shop all {DEPARTMENT_TITLES[dept].toLowerCase()}
          </Link>
        </div>
      </div>
    </section>
  )
}
