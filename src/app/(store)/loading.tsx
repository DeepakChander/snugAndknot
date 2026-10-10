export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-beige border-t-terracotta rounded-full animate-spin mb-4" />
        <p className="text-sm text-earth">Loading...</p>
      </div>
    </div>
  )
}
