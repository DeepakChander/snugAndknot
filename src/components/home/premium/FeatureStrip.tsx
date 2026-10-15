import type { HomeFeature } from '@/types/commerce'

/** Thin line icons, drawn for the promise strip (1.4px strokes on a 32px grid). */
const ICONS: Record<HomeFeature['icon'], React.ReactNode> = {
  fabric: (
    <>
      <path d="M5 11l11-6 11 6-11 6z" />
      <path d="M5 16l11 6 11-6M5 21l11 6 11-6" />
    </>
  ),
  factory: (
    <>
      <path d="M4 27V14l7 4v-4l7 4v-4l7 4V6h3v21z" />
      <path d="M9 22h3M15 22h3M21 22h3" />
    </>
  ),
  leaf: (
    <>
      <path d="M7 25C7 13 14 6 26 6c0 12-7 19-19 19z" />
      <path d="M7 25l11-11" />
    </>
  ),
  truck: (
    <>
      <path d="M3 9h16v13H3zM19 13h6l4 5v4h-10" />
      <circle cx="9" cy="24" r="2.5" />
      <circle cx="24" cy="24" r="2.5" />
    </>
  ),
  returns: (
    <>
      <path d="M8 12h13a6 6 0 010 12H12" />
      <path d="M12 7l-5 5 5 5" />
    </>
  ),
  needle: (
    <>
      <path d="M6 26L24 8" />
      <path d="M22 6a3 3 0 014 4" />
      <path d="M10 18c-4 1-6 4-4 6s5 0 6-4" />
    </>
  ),
}

/** Up to four promises between the categories and the products, divided by hairlines. */
export default function FeatureStrip({ features }: { features: HomeFeature[] }) {
  if (!features.length) return null
  return (
    <section aria-label="Our promises" className="border-y border-ink/[0.07] bg-ivory/60 text-ink">
      <ul className="container-wide grid grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <li
            key={f.title}
            className={`flex items-center gap-4 py-7 pr-4 md:py-9 lg:justify-center lg:px-6 ${i % 2 ? 'border-l border-ink/10 pl-4 lg:pl-6' : ''} ${i > 1 ? 'border-t border-ink/10 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <svg viewBox="0 0 32 32" aria-hidden className="h-8 w-8 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[f.icon]}
            </svg>
            <span>
              <span className="block text-[0.92rem] font-medium">{f.title}</span>
              {f.body ? <span className="mt-0.5 block text-[0.78rem] text-stone">{f.body}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
