'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useNavData, type NavData } from '@/components/providers/SettingsProvider'
import { categoryHref, DEPARTMENT_TITLES, type Department } from '@/lib/categories'

export interface MenuGroup {
  heading: string
  links: { label: string; href: string }[]
}

/**
 * One department's menu: the shortcuts first, then its categories under their menu headings, in
 * admin order. Only categories with active pieces reach here (NavData), so nothing leads to an
 * empty page.
 */
export function departmentMenu(nav: NavData, dept: Department): MenuGroup[] {
  const title = DEPARTMENT_TITLES[dept]
  const own = nav.categories.filter((c) => c.department === dept && c.showInMenu)
  const headings = [...new Set(own.map((c) => c.group))]
  return [
    {
      heading: 'Highlights',
      links: [
        { label: 'New in', href: `/shop/${dept}?sort=newest` },
        { label: `Shop all ${title.toLowerCase()}`, href: `/shop/${dept}` },
      ],
    },
    ...headings.map((h) => ({
      heading: h || 'Categories',
      links: own.filter((c) => c.group === h).map((c) => ({ label: c.title, href: categoryHref(c) })),
    })),
  ]
}

/** The panel that drops under the bar while a department is hovered or focused. */
export default function MegaMenu({ dept, onEnter, onLeave, onNavigate }: { dept: Department | null; onEnter: () => void; onLeave: () => void; onNavigate: () => void }) {
  const nav = useNavData()
  return (
    <AnimatePresence>
      {dept ? (
        <motion.div
          key="mega"
          id="mega-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="absolute inset-x-0 top-full hidden border-b border-t border-ink/10 bg-white lg:block"
        >
          <motion.div key={dept} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="container-wide flex gap-12 py-9">
            <nav aria-label={`${DEPARTMENT_TITLES[dept]} categories`} className="grid flex-1 grid-cols-4 gap-x-10 gap-y-8 xl:grid-cols-5">
              {departmentMenu(nav, dept).map((g) => (
                <div key={g.heading}>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-stone">{g.heading}</p>
                  <ul className="mt-3.5 space-y-2.5">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={onNavigate} className="text-[0.9rem] text-ink/85 underline-offset-4 transition-colors hover:text-ink hover:underline">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            {nav.departments[dept].image ? (
              <Link href={`/shop/${dept}`} onClick={onNavigate} className="group relative block w-[clamp(180px,16vw,240px)] shrink-0">
                <span className="relative block aspect-[3/4] overflow-hidden bg-parchment">
                  <Image src={nav.departments[dept].image} alt="" fill sizes="240px" className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" />
                </span>
                <span className="mt-2.5 block text-[0.8rem] font-medium uppercase tracking-[0.1em]">Shop {DEPARTMENT_TITLES[dept]}</span>
              </Link>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
