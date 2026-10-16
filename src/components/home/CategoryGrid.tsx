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
 * "Shop by category": every department's categories as photograph tiles, the name under each, with
 * an All tab (first, and open by default) and a tab per department. Fed by the categories marked
 * "Show on home page" in the admin that have an image, in admin order; a department with none has
 * no tab, and the section is left out when no department has any.
 */
export default function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  const departments = (['women', 'men', 'kids'] as const).filter((d) => tiles.some((t) => t.department === d))
  const [dept, setDept] = useState<Department | 'all'>('all')
  if (!departments.length) return null
  const active = dept !== 'all' && departments.includes(dept) ? dept : 'all'
  // Under All the departments take turns (Women, Men, Kids, Women …), each in admin order, so the
  // first row is not one department alone.
  const byDept = departments.map((d) => tiles.filter((t) => t.department === d))
  const mixed = Array.from({ length: Math.max(...byDept.map((l) => l.length)) }, (_, i) => byDept.map((l) => l[i]).filter((t): t is CategoryTile => !!t)).flat()
  const shown = active === 'all' ? mixed : tiles.filter((t) => t.department === active)
  const tabs = ['all', ...departments] as const

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
              {tabs.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  id={`category-tab-${d}`}
                  aria-selected={active === d}
                  aria-controls="category-grid-panel"
                  onClick={() => setDept(d)}
                  className={cn(
                    'relative pb-1.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors',
                    active === d ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink' : 'text-ink/50 hover:text-ink'
                  )}
                >
                  {d === 'all' ? 'All' : DEPARTMENT_TITLES[d]}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <ul id="category-grid-panel" role="tabpanel" aria-labelledby={`category-tab-${active}`} className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
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
                {/* Under All, "Shirts" could be Men's or Women's: the department says which. */}
                {active === 'all' && departments.length > 1 ? <span className="mt-0.5 block text-[0.72rem] uppercase tracking-[0.12em] text-stone">{DEPARTMENT_TITLES[t.department]}</span> : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href={active === 'all' ? '/shop' : `/shop/${active}`} className="inline-block border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
            {active === 'all' ? 'Shop everything' : `Shop all ${DEPARTMENT_TITLES[active].toLowerCase()}`}
          </Link>
        </div>
      </div>
    </section>
  )
}
