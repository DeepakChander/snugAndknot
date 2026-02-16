import GoldStar from './GoldStar'

export default function ReviewStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <GoldStar key={i} filled={i < Math.floor(value)} partial={!((i < Math.floor(value))) && i < value} />
      ))}
    </div>
  )
}
