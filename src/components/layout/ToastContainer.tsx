'use client'

import { useUIStore } from '@/stores/ui-store'

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] ${
            toast.type === 'success'
              ? 'bg-charcoal text-cream'
              : toast.type === 'error'
                ? 'bg-red-900 text-cream'
                : 'bg-cream-dark text-charcoal border border-beige'
          }`}
        >
          {toast.type === 'success' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
