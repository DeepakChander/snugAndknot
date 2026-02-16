'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'

const Scene = dynamic(() => import('@/components/3d/SceneWrapper'), { ssr: false })
const Knot = dynamic(() => import('@/components/3d/KnotModel'), { ssr: false })

/* ──────────────────────────────────────────────────────────
   AUTH MODAL
   Full-screen login / signup / forgot-password overlay
   Left panel: 3D torus-knot, Right panel: form
   ────────────────────────────────────────────────────────── */

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authMode,
    closeAuthModal,
    setAuthMode,
    login,
    signup,
  } = useAuthStore()

  const addToast = useUIStore((s) => s.addToast)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shakeForm, setShakeForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Refs for focus trap
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLInputElement>(null)
  const lastFocusRef = useRef<HTMLButtonElement>(null)

  // --------------------------------------------------
  // Escape key closes modal
  // --------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal()
      }
    }
    if (isAuthModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      useUIStore.getState().lenisStop?.()
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }
  }, [isAuthModalOpen, closeAuthModal])

  // --------------------------------------------------
  // Focus trap
  // --------------------------------------------------
  useEffect(() => {
    if (isAuthModalOpen && firstFocusRef.current) {
      // Slight delay to allow the animation to start
      const timer = setTimeout(() => firstFocusRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [isAuthModalOpen, authMode])

  const handleFocusTrap = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'input, button, a, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    []
  )

  // --------------------------------------------------
  // Reset form on mode change
  // --------------------------------------------------
  useEffect(() => {
    setError('')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }, [authMode])

  // --------------------------------------------------
  // Trigger shake animation on error
  // --------------------------------------------------
  const triggerShake = useCallback(() => {
    setShakeForm(true)
    const timer = setTimeout(() => setShakeForm(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // --------------------------------------------------
  // Submit handlers
  // --------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (authMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name.')
        triggerShake()
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        triggerShake()
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        triggerShake()
        return
      }
    }

    if (authMode === 'forgot-password') {
      if (!email.trim()) {
        setError('Please enter your email address.')
        triggerShake()
        return
      }
      // Mock forgot password
      setIsLoading(true)
      await new Promise((r) => setTimeout(r, 800))
      setIsLoading(false)
      addToast('Password reset link sent to your email.', 'success')
      setAuthMode('login')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      triggerShake()
      return
    }

    setIsLoading(true)

    try {
      let success = false
      if (authMode === 'login') {
        success = await login(email, password)
      } else {
        success = await signup(name, email, password)
      }

      if (success) {
        addToast(
          authMode === 'login'
            ? 'Welcome back! You are now signed in.'
            : 'Welcome to Snug&Knot! Your account has been created.',
          'success'
        )
      } else {
        setError('Authentication failed. Please try again.')
        triggerShake()
      }
    } catch {
      setError('Something went wrong. Please try again.')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  // --------------------------------------------------
  // Render nothing when closed
  // --------------------------------------------------
  if (!isAuthModalOpen) return null

  const modeLabel =
    authMode === 'login'
      ? 'Sign In'
      : authMode === 'signup'
        ? 'Create Account'
        : 'Reset Password'

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={modeLabel}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out_both]"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal container -- scale entrance */}
      <div
        ref={modalRef}
        onKeyDown={handleFocusTrap}
        className="relative z-10 w-full max-w-[960px] max-h-[90vh] mx-4 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-ivory shadow-2xl animate-[modalIn_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{
          borderRadius: 0,
        }}
      >
        {/* ════════════════════════════════════════════
            LEFT PANEL — 3D Knot Scene
           ════════════════════════════════════════════ */}
        <div className="hidden lg:flex relative items-center justify-center overflow-hidden bg-burgundy-deep">
          {/* Subtle pattern overlay */}
          <div className="knit-pattern-gold absolute inset-0" />

          {/* 3D Canvas */}
          <Scene
            className="absolute inset-0 w-full h-full"
            camera={{ position: [0, 0, 4], fov: 50 }}
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-burgundy to-gold opacity-30" />
              </div>
            }
          >
            <Knot scale={1.2} speed={0.2} p={3} q={5} />
          </Scene>

          {/* Brand text overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <p className="font-heading text-2xl text-gold mb-2">Snug&Knot</p>
            <p className="text-sm text-silk/70 leading-relaxed">
              Join our community of conscious fashion lovers. Unlock exclusive
              rewards, early access, and member-only collections.
            </p>
          </div>

          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(61,10,14,0.9), transparent)',
            }}
          />
        </div>

        {/* ════════════════════════════════════════════
            RIGHT PANEL — Form
           ════════════════════════════════════════════ */}
        <div className="relative flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-14 overflow-y-auto max-h-[90vh]">
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-burgundy/60 hover:text-burgundy transition-colors duration-200"
            aria-label="Close authentication dialog"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Mode heading with crossfade */}
          <div className="mb-8">
            <div
              key={authMode}
              className="animate-[crossfadeIn_0.3s_ease-out_both]"
            >
              <h2 className="font-heading text-3xl sm:text-4xl text-burgundy mb-2">
                {modeLabel}
              </h2>
              <p className="text-sm text-wine/70">
                {authMode === 'login'
                  ? 'Welcome back. Enter your credentials to continue.'
                  : authMode === 'signup'
                    ? 'Create an account to start collecting rewards.'
                    : 'Enter your email and we\'ll send a reset link.'}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mb-4 px-4 py-3 text-sm bg-error-garnet/10 text-error-garnet border border-error-garnet/20"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={shakeForm ? 'animate-[formShake_0.5s_cubic-bezier(0.34,1.56,0.64,1.0)_both]' : ''}
            noValidate
          >
            <div className="space-y-5">
              {/* Name field (signup only) */}
              {authMode === 'signup' && (
                <FloatingField
                  ref={firstFocusRef}
                  id="auth-name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                  required
                />
              )}

              {/* Email field */}
              <FloatingField
                ref={authMode !== 'signup' ? firstFocusRef : undefined}
                id="auth-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
              />

              {/* Password field (login/signup) */}
              {authMode !== 'forgot-password' && (
                <div className="relative">
                  <FloatingField
                    id="auth-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wine/50 hover:text-wine transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Confirm password (signup only) */}
              {authMode === 'signup' && (
                <FloatingField
                  id="auth-confirm-password"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  required
                />
              )}

              {/* Forgot password link (login mode) */}
              {authMode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-xs text-wine/60 hover:text-burgundy transition-colors underline underline-offset-2"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              ref={lastFocusRef}
              type="submit"
              disabled={isLoading}
              className="group relative mt-8 w-full py-3.5 text-sm font-semibold tracking-wider uppercase overflow-hidden bg-burgundy text-gold transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Gold gradient fill on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-gold via-gold-pale to-gold translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-[var(--ease-yarn-pull)]" />
              <span className="relative z-10 group-hover:text-burgundy-deep transition-colors duration-300">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="60"
                        strokeDashoffset="20"
                        strokeLinecap="round"
                      />
                    </svg>
                    {authMode === 'login'
                      ? 'Signing In...'
                      : authMode === 'signup'
                        ? 'Creating Account...'
                        : 'Sending Link...'}
                  </span>
                ) : (
                  modeLabel
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gold-muted/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-wine/50 bg-ivory">or</span>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="text-center text-sm text-wine/70">
            {authMode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="font-semibold text-burgundy hover:text-burgundy-light underline underline-offset-2 transition-colors"
                >
                  Create Account
                </button>
              </p>
            ) : authMode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-semibold text-burgundy hover:text-burgundy-light underline underline-offset-2 transition-colors"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-semibold text-burgundy hover:text-burgundy-light underline underline-offset-2 transition-colors"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Keyframe styles injected inline for this component */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes crossfadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes formShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-12px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-8px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(1px); }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   FLOATING LABEL INPUT
   Gold underline on focus, label floats above when active
   ────────────────────────────────────────────────────────── */

import React from 'react'

interface FloatingFieldProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
}

const FloatingField = React.forwardRef<HTMLInputElement, FloatingFieldProps>(
  ({ id, label, type, value, onChange, autoComplete, required }, ref) => {
    const hasValue = value.length > 0

    return (
      <div className="relative group">
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          placeholder=" "
          className="peer w-full pt-5 pb-2 px-0 text-sm text-burgundy bg-transparent border-0 border-b border-dust/50 focus:border-gold focus:outline-none transition-colors duration-300"
          aria-label={label}
        />
        <label
          htmlFor={id}
          className={`absolute left-0 text-sm transition-all duration-300 pointer-events-none
            ${
              hasValue
                ? 'top-0 text-[10px] font-semibold tracking-wider uppercase text-gold-muted'
                : 'top-4 text-wine/50'
            }
            peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:tracking-wider peer-focus:uppercase peer-focus:text-gold-muted
          `}
        >
          {label}
        </label>
        {/* Gold underline bar that scales in on focus */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] scale-x-0 peer-focus:scale-x-100 bg-gold transition-transform duration-500 ease-[var(--ease-yarn-pull)] origin-center" />
      </div>
    )
  }
)

FloatingField.displayName = 'FloatingField'
