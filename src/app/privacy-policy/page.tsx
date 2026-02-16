import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl sm:text-5xl text-burgundy mb-6">Privacy Policy</h1>
        <div className="w-16 h-px bg-gold mb-8" />
        <p className="text-wine/80 leading-relaxed mb-8">
          Our privacy policy details how we collect, use, and protect your personal information.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-gold transition-colors duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
