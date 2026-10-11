/** Shown while a page streams in (the curtain transition usually covers it). */
export default function Loading() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-ivory" aria-busy="true" aria-label="Loading">
      <span className="relative block h-px w-40 overflow-hidden bg-ink/10">
        <span className="absolute inset-y-0 left-0 w-1/3 animate-[loadbar_1.1s_cubic-bezier(.76,0,.24,1)_infinite] bg-burgundy" />
      </span>
      <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  )
}
