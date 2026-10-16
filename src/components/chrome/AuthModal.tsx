'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { useSettings } from '@/components/providers/SettingsProvider'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { Button } from '@/components/kit/Button'
import { Field } from '@/components/kit/Field'
import { cn } from '@/lib/format'

const EASE = [0.16, 1, 0.3, 1] as const

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, signup, error, fieldErrors } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const { store } = useSettings()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const ok = authMode === 'signup' ? await signup(name, email, password) : await login(email, password)
    setBusy(false)
    if (ok) {
      const user = useAuthStore.getState().user
      addToast(authMode === 'signup' ? `Welcome to Snug&Knot, ${user?.name.split(' ')[0]}. 100 points added.` : `Welcome back, ${user?.name.split(' ')[0]}.`)
      setPassword('')
    }
  }

  const tabs = [
    { id: 'login' as const, label: 'Sign in' },
    { id: 'signup' as const, label: 'Create account' },
  ]

  return (
    <Overlay open={isAuthModalOpen} onClose={closeAuthModal} label={authMode === 'signup' ? 'Create an account' : 'Sign in'} side="center" className="bg-ivory text-ink">
      <div className="grid md:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden min-h-[560px] overflow-hidden md:block">
          <Image src="/images/lookbook/quiet-luxury-1.png" alt="" fill sizes="45vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/10 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-bone">
            <p className="text-eyebrow text-bone/70">Members</p>
            <p className="mt-3 text-[1.6rem] font-medium leading-[0.95]">Save your bag, track orders, earn points on every piece.</p>
          </div>
        </div>

        <div className="relative p-7 sm:p-10">
          <CloseButton onClick={closeAuthModal} className="absolute right-5 top-5" />

          {authMode === 'forgot-password' ? (
            <div className="pt-6">
              <h2 className="text-[1.6rem] font-medium">Forgotten your password?</h2>
              <p className="mt-4 text-stone">
                Email us from the address on your account and we will reset it for you, usually within one working day.
              </p>
              <a href={`mailto:${store.email}?subject=Password%20reset`} className="btn mt-8 h-12 bg-ink px-7 text-sm text-ivory">
                <span className="btn-fill" />
                Email {store.email}
              </a>
              <button type="button" onClick={() => setAuthMode('login')} className="link-wipe mt-6 block text-sm">
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="relative mt-4 flex gap-6 border-b border-ink/10" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={authMode === t.id}
                    onClick={() => setAuthMode(t.id)}
                    className={cn('relative pb-3 text-sm transition-colors', authMode === t.id ? 'text-ink' : 'text-stone hover:text-ink')}
                  >
                    {t.label}
                    {authMode === t.id ? <motion.span layoutId="auth-tab" className="absolute inset-x-0 -bottom-px h-[2px] bg-burgundy" transition={{ duration: 0.5, ease: EASE }} /> : null}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.form
                  key={authMode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  onSubmit={submit}
                  className="mt-8 space-y-4"
                  noValidate
                >
                  <h2 className="text-[1.6rem] font-medium leading-none">{authMode === 'signup' ? 'Create an account' : 'Welcome back'}</h2>
                  <p className="pb-2 text-sm text-stone">
                    {authMode === 'signup' ? 'Create an account and receive 100 welcome points.' : 'Sign in to see your orders, wishlist and rewards.'}
                  </p>
                  {authMode === 'signup' ? (
                    <Field label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} data-autofocus />
                  ) : null}
                  <Field
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                    {...(authMode === 'login' ? { 'data-autofocus': true } : {})}
                  />
                  <Field
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    minLength={authMode === 'signup' ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password}
                    hint={authMode === 'signup' ? 'At least 8 characters.' : undefined}
                    trailing={
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="text-label text-stone hover:text-ink" aria-label={showPw ? 'Hide password' : 'Show password'}>
                        {showPw ? 'Hide' : 'Show'}
                      </button>
                    }
                  />
                  {error ? (
                    <p role="alert" className="bg-error/[0.07] px-4 py-3 text-sm text-error">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" size="lg" block loading={busy} arrow>
                    {authMode === 'signup' ? 'Create account' : 'Sign in'}
                  </Button>
                  {authMode === 'login' ? (
                    <button type="button" onClick={() => setAuthMode('forgot-password')} className="link-wipe text-sm text-stone">
                      Forgotten password?
                    </button>
                  ) : (
                    <p className="text-xs text-stone">By creating an account you agree to our terms of service and privacy policy.</p>
                  )}
                </motion.form>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </Overlay>
  )
}
