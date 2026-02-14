import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-charcoal mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-3 bg-transparent border border-beige rounded-lg text-sm text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors',
          error && 'border-red-400 focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
