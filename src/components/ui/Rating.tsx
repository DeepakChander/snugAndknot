interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  showValue?: boolean
  count?: number
}

export default function Rating({ value, max = 5, size = 'sm', showValue = false, count }: RatingProps) {
  const starSize = size === 'sm' ? 14 : 18

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value)
          const partial = !filled && i < value
          return (
            <svg
              key={i}
              width={starSize}
              height={starSize}
              viewBox="0 0 24 24"
              className={filled ? 'text-terracotta' : partial ? 'text-terracotta/50' : 'text-sand'}
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )
        })}
      </div>
      {showValue && <span className="text-xs text-earth">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-earth">({count})</span>}
    </div>
  )
}
