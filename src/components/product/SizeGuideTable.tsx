import { SIZE_GUIDE } from '@/lib/size-guide'
import { cn } from '@/lib/format'

export default function SizeGuideTable({ highlight, className }: { highlight?: string | null; className?: string }) {
  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full text-sm">
          <caption className="sr-only">Body measurements in inches</caption>
          <thead className="bg-ink/[0.03] text-left">
            <tr>
              {['Size', 'Chest', 'Waist', 'Hips'].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-eyebrow font-normal text-stone">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE.rows.map((r) => (
              <tr key={r.size} className={cn('border-t border-ink/10', highlight === r.size && 'bg-gold/15')}>
                <th scope="row" className="px-4 py-3 text-left font-mono">
                  {r.size}
                </th>
                <td className="px-4 py-3 font-mono tabular-nums">{r.chest}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{r.waist}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{r.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone">Body measurements in inches.</p>
      <dl className="mt-6 space-y-3 text-sm">
        {SIZE_GUIDE.howTo.map((h) => (
          <div key={h.label}>
            <dt className="font-medium">{h.label}</dt>
            <dd className="text-stone">{h.text}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 rounded-2xl bg-parchment/60 p-4 text-sm">{SIZE_GUIDE.fitNote}</p>
    </div>
  )
}
