import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-8xl lg:text-9xl text-charcoal mb-4">404</h1>
        <p className="text-xl text-walnut mb-2">Page Not Found</p>
        <p className="text-earth mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex px-8 py-3.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
