'use client'

import { useState } from 'react'
import FloatingInput from './FloatingInput'

const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
  { name: 'street', label: 'Street Address', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true, half: true },
  { name: 'state', label: 'State', type: 'text', required: true, half: true },
  { name: 'zip', label: 'ZIP Code', type: 'text', required: true, half: true },
  { name: 'country', label: 'Country', type: 'text', required: true, half: true },
]

export default function InformationStep({
  address,
  onUpdate,
  onNext,
}: {
  address: Record<string, unknown>
  onUpdate: (data: Record<string, unknown>) => void
  onNext: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    FIELDS.forEach((field) => {
      if (field.required && !address[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (address.email && typeof address.email === 'string') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="font-heading text-2xl sm:text-3xl text-burgundy mb-2">
        Contact Information
      </h2>
      <p className="text-sm text-wine mb-8">
        We&apos;ll use this to send your order confirmation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
        {FIELDS.map((field) => (
          <div
            key={field.name}
            className={`relative ${'half' in field && field.half ? '' : 'sm:col-span-2'}`}
          >
            <FloatingInput
              name={field.name}
              label={field.label}
              type={field.type}
              value={(address[field.name] as string) || ''}
              onChange={(val) => {
                onUpdate({ ...address, [field.name]: val })
                if (errors[field.name]) {
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next[field.name]
                    return next
                  })
                }
              }}
              error={errors[field.name]}
              required={field.required}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors"
        >
          Continue to Shipping
        </button>
      </div>
    </form>
  )
}
