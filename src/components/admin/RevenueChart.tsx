'use client'

import { useMemo, useRef, useState } from 'react'
import { useMoney } from '@/components/providers/SettingsProvider'

const W = 760
const H = 240
const PAD = { l: 52, r: 16, t: 16, b: 28 }
const SERIES = '#9b2335' // garnet — validated on the admin surface

function niceMax(v: number) {
  if (v <= 0) return 100
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

/** 30-day revenue: 2px line, 10% wash, hairline grid, crosshair tooltip, table fallback. */
export default function RevenueChart({ data }: { data: { day: string; revenue: number; orders: number }[] }) {
  const money = useMoney()
  const svg = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [table, setTable] = useState(false)

  const { points, max, ticks } = useMemo(() => {
    const max = niceMax(Math.max(...data.map((d) => d.revenue), 0))
    const iw = W - PAD.l - PAD.r
    const ih = H - PAD.t - PAD.b
    const points = data.map((d, i) => ({ x: PAD.l + (data.length > 1 ? (i / (data.length - 1)) * iw : iw / 2), y: PAD.t + ih - (d.revenue / max) * ih, d }))
    return { points, max, ticks: [0, 0.25, 0.5, 0.75, 1].map((f) => f * max) }
  }, [data])

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${points[points.length - 1]?.x ?? 0},${H - PAD.b} L${points[0]?.x ?? 0},${H - PAD.b} Z`
  const total = data.reduce((s, d) => s + d.revenue, 0)
  const short = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = svg.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    let best = 0
    points.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(points[best].x - x)) best = i
    })
    setHover(best)
  }

  const h = hover !== null ? points[hover] : null

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-stone">Revenue, last 30 days (excludes cancelled orders)</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{money(total)}</p>
        </div>
        <button type="button" onClick={() => setTable((t) => !t)} className="rounded-full border border-ink/15 px-3 py-1 text-xs hover:border-ink/40" aria-pressed={table}>
          {table ? 'Show chart' : 'Show table'}
        </button>
      </div>
      {table ? (
        <div className="max-h-72 overflow-auto rounded-xl border border-ink/10">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-stone">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Orders</th>
                <th className="px-3 py-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-ink/5">
                  <td className="px-3 py-1.5">{short(d.day)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{d.orders}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{money(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svg}
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none"
            role="img"
            aria-label={`Revenue over the last 30 days, total ${money(total)}`}
            tabIndex={0}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setHover((x) => Math.min(points.length - 1, (x ?? -1) + 1))
              if (e.key === 'ArrowLeft') setHover((x) => Math.max(0, (x ?? points.length) - 1))
            }}
            onBlur={() => setHover(null)}
          >
            {ticks.map((t) => {
              const y = PAD.t + (H - PAD.t - PAD.b) - (t / max) * (H - PAD.t - PAD.b)
              return (
                <g key={t}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="rgba(22,16,14,0.08)" strokeWidth={1} />
                  <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(22,16,14,0.55)" className="tabular-nums">
                    {t >= 1000 ? `${Math.round(t / 100) / 10}k` : Math.round(t)}
                  </text>
                </g>
              )
            })}
            {[0, Math.floor(data.length / 2), data.length - 1].map((i) =>
              points[i] ? (
                <text key={i} x={points[i].x} y={H - 8} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} fontSize="11" fill="rgba(22,16,14,0.55)">
                  {short(points[i].d.day)}
                </text>
              ) : null
            )}
            <path d={area} fill={SERIES} opacity={0.1} />
            <path d={line} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {points.length ? <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={SERIES} stroke="#fbf8f2" strokeWidth={2} /> : null}
            {h ? (
              <g>
                <line x1={h.x} x2={h.x} y1={PAD.t} y2={H - PAD.b} stroke="rgba(22,16,14,0.25)" strokeWidth={1} />
                <circle cx={h.x} cy={h.y} r={5} fill={SERIES} stroke="#fbf8f2" strokeWidth={2} />
              </g>
            ) : null}
          </svg>
          {h ? (
            <div
              className="pointer-events-none absolute top-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs shadow-lg"
              style={{ left: `${(h.x / W) * 100}%`, transform: `translateX(${h.x / W > 0.7 ? '-105%' : '8px'})` }}
            >
              <p className="text-sm font-semibold tabular-nums">{money(h.d.revenue)}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-stone">
                <span className="inline-block h-0.5 w-3 rounded" style={{ background: SERIES }} />
                {short(h.d.day)} · {h.d.orders} order{h.d.orders === 1 ? '' : 's'}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
