const OPTIONS = [
  {
    id: 'standard' as const,
    name: 'Standard Shipping',
    price: 'Free',
    time: '3-5 business days',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="6" width="22" height="15" rx="2" />
        <path d="M1 10h22" />
        <path d="M7 15h4" />
      </svg>
    ),
  },
  {
    id: 'express' as const,
    name: 'Express Shipping',
    price: '$12.00',
    time: '1-2 business days',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
]

export default function ShippingStep({
  method,
  onSelect,
  onNext,
  onPrev,
}: {
  method: 'standard' | 'express'
  onSelect: (m: 'standard' | 'express') => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl sm:text-3xl text-burgundy mb-2">
        Shipping Method
      </h2>
      <p className="text-sm text-wine mb-8">
        Choose how you&apos;d like to receive your order.
      </p>

      <div className="space-y-3">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all duration-300 ${
              method === option.id
                ? 'border-burgundy bg-burgundy/5'
                : 'border-silk bg-parchment hover:border-dust'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                method === option.id ? 'border-burgundy' : 'border-dust'
              }`}
            >
              {method === option.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-burgundy" />
              )}
            </div>
            <div
              className={`transition-colors ${
                method === option.id ? 'text-burgundy' : 'text-wine'
              }`}
            >
              {option.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-burgundy text-sm">{option.name}</p>
              <p className="text-xs text-rosewood mt-0.5">{option.time}</p>
            </div>
            <span
              className={`font-mono text-sm font-medium ${
                method === option.id ? 'text-burgundy' : 'text-wine'
              }`}
            >
              {option.price}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 text-sm text-wine hover:text-burgundy transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
