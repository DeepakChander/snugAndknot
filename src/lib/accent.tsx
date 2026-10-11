import { Fragment, type ReactNode } from 'react'

/**
 * Turns `*words*` in editable copy into the italic serif accent:
 * "Knitwear made slowly, *to wear for years*." → grotesk with one italic phrase.
 * Unmatched asterisks are left as typed.
 */
export function accent(text: string): ReactNode {
  const parts = text.split(/(\*[^*\n]+\*)/g)
  return parts.map((part, i) =>
    part.length > 2 && part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>
  )
}

/** The same copy with the asterisks removed — for aria-labels, titles and meta tags. */
export function plain(text: string): string {
  return text.replace(/\*([^*\n]+)\*/g, '$1')
}
