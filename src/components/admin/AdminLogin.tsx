'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Wordmark from '@/components/chrome/Wordmark'
import { api, ApiError } from '@/lib/api'
import type { PublicUser } from '@/types/commerce'

export default function AdminLogin({ problems, denied }: { problems: string[]; denied: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(denied ? 'That account does not have admin access.' : null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { user } = await api<{ user: PublicUser }>('/api/auth/login', { body: { email, password } })
      if (user.role !== 'admin') {
        await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
        setError('That account does not have admin access.')
        setBusy(false)
        return
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed.')
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-[100svh] bg-noir text-bone lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="/images/collection-home/Material-Intimacy.png" alt="" fill preload sizes="50vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/30" />
        <p className="absolute bottom-10 left-10 max-w-sm font-display text-4xl leading-tight">Run the shop: pieces, orders, reviews and every setting in one place.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5" noValidate>
          <div>
            <Wordmark className="text-4xl" />
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold">Admin</p>
          </div>
          <h1 className="pt-6 font-display text-4xl">Sign in</h1>
          {problems.length ? (
            <div role="status" className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs leading-relaxed text-bone/80">
              <p>
                Admin sign-in is off until the server has <code className="font-mono">ADMIN_EMAIL</code> and <code className="font-mono">ADMIN_PASSWORD</code> (12+ characters). On Vercel, set them for <strong>Production</strong> under Settings → Environment Variables, then redeploy: a deployment only sees variables that existed when it was built.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-xs text-bone/60">Email</span>
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-bone/15 bg-bone/[0.04] px-4 py-3 outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-bone/60">Password</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-bone/15 bg-bone/[0.04] px-4 py-3 outline-none focus:border-gold" />
          </label>
          {error ? (
            <p role="alert" className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center rounded-full bg-gold font-medium text-ink transition-colors hover:bg-gold-light disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <Link href="/" className="block text-center text-xs text-bone/50 hover:text-bone">
            ← Back to the store
          </Link>
        </form>
      </div>
    </div>
  )
}
