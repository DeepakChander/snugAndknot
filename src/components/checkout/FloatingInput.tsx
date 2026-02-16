'use client'

import { useState } from 'react'

interface FloatingInputProps {
  name: string
  label: string
  type?: string
  value: string
  onChange: (val: string) => void
  error?: string
  required?: boolean
  variant?: 'bordered' | 'underline'
}

export default function FloatingInput({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required,
  variant = 'bordered',
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const isFloating = focused || value.length > 0

  if (variant === 'underline') {
    return (
      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-dust/40" />
        <div
          className="absolute bottom-0 left-0 h-px origin-left transition-transform duration-400 bg-gold"
          style={{
            transform: focused ? 'scaleX(1)' : 'scaleX(0)',
            transitionTimingFunction: 'cubic-bezier(0.22, 0.68, 0.36, 1.0)',
          }}
        />
        <label
          htmlFor={name}
          className="absolute left-0 pointer-events-none origin-left transition-all duration-250"
          style={{
            color: focused ? 'var(--color-gold)' : 'var(--color-dust)',
            transform: isFloating ? 'translateY(-20px) scale(0.75)' : 'translateY(0) scale(1)',
            opacity: isFloating ? 1 : 0.6,
            transitionTimingFunction: 'cubic-bezier(0.22, 0.68, 0.36, 1.0)',
          }}
        >
          <span className="text-sm tracking-wide">{label}</span>
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className="w-full bg-transparent pt-5 pb-3 text-wine text-sm outline-none placeholder-transparent"
          placeholder={label}
          autoComplete="off"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className={`w-full px-4 pt-5 pb-2 bg-ivory border rounded-lg text-sm text-burgundy transition-colors duration-200 peer focus:outline-none ${
            error
              ? 'border-error-garnet'
              : focused
              ? 'border-burgundy'
              : 'border-dust'
          }`}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <label
          htmlFor={name}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            isFloating
              ? 'top-1.5 text-[10px] tracking-wider uppercase'
              : 'top-3.5 text-sm'
          } ${
            error
              ? 'text-error-garnet'
              : focused
              ? 'text-burgundy'
              : 'text-rosewood'
          }`}
        >
          {label}
          {required && <span className="text-error-garnet ml-0.5">*</span>}
        </label>
      </div>
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-xs text-error-garnet"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
