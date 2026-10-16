import type { Category } from '@/types/commerce'

export const DEPARTMENT_ORDER = ['men', 'women', 'kids'] as const
export type Department = (typeof DEPARTMENT_ORDER)[number]

export const DEPARTMENT_TITLES: Record<Department, string> = { men: 'Men', women: 'Women', kids: 'Kids' }

export function isDepartment(value: string): value is Department {
  return (DEPARTMENT_ORDER as readonly string[]).includes(value)
}

/** The part of a department category's slug after the department: "men-shirts" → "shirts". */
export function categoryPathSlug(c: Pick<Category, 'slug' | 'department'>): string {
  return c.department && c.slug.startsWith(`${c.department}-`) ? c.slug.slice(c.department.length + 1) : c.slug
}

/** /shop/men/shirts for a department's category; /shop/<slug> for an older one with no department. */
export function categoryHref(c: Pick<Category, 'slug' | 'department'>): string {
  return c.department ? `/shop/${c.department}/${categoryPathSlug(c)}` : `/shop/${c.slug}`
}

/** A title that stands on its own: "Men's shirts", "Boys T-shirts"; older categories keep theirs. */
export function categoryFullTitle(c: Pick<Category, 'title' | 'department' | 'group'>): string {
  if (!c.department) return c.title
  if (c.department === 'kids') return c.group ? `${c.group} ${c.title}` : `Kids' ${c.title}`
  return `${DEPARTMENT_TITLES[c.department]}'s ${c.title.toLowerCase()}`
}
