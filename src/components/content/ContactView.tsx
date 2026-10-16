'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSettings } from '@/components/providers/SettingsProvider'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/kit/Button'
import { Field, Select, TextArea } from '@/components/kit/Field'
import { CheckIcon, MailIcon, PhoneIcon } from '@/components/kit/icons'
import { api, ApiError } from '@/lib/api'

const TOPICS = ['An order', 'Sizing and fit', 'Returns', 'Care and repairs', 'Press and collaborations', 'Something else']

export default function ContactView() {
  const { store } = useSettings()
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({ name: '', email: '', subject: TOPICS[0], message: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const name = form.name || user?.name || ''
  const email = form.email || user?.email || ''

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setError(null)
    try {
      await api('/api/contact', { body: { name, email, subject: form.subject, message: form.message } })
      setSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields ?? {})
        setError(err.message)
      } else setError('Could not send your message.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-ivory pt-nav text-ink">
      <div className="container-wide grid gap-14 pb-28 pt-12 md:pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-eyebrow text-stone">Contact</p>
          <h1 className="mt-4 text-display">
            Write to <em>us</em>
          </h1>
          <p className="mt-8 max-w-md text-lead text-stone">A real person reads every message. Tell us what you need and we will reply by email.</p>
          <ul className="mt-12 space-y-5">
            <li className="flex items-start gap-4">
              <MailIcon size={20} className="mt-0.5 text-ink" />
              <a href={`mailto:${store.email}`} className="link-wipe text-lg">
                {store.email}
              </a>
            </li>
            {store.phone ? (
              <li className="flex items-start gap-4">
                <PhoneIcon size={20} className="mt-0.5 text-ink" />
                <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="link-wipe text-lg">
                  {store.phone}
                </a>
              </li>
            ) : null}
          </ul>
          <div className="relative mt-14 hidden aspect-[5/4] overflow-hidden lg:block">
            <Image src="/images/collection-home/Lived-In.png" alt="" fill sizes="40vw" className="object-cover" />
          </div>
          <p className="mt-8 text-sm text-stone">
            Looking for an order?{' '}
            <Link href="/track" className="link-wipe text-ink">
              Track it here
            </Link>{' '}
            or read the{' '}
            <Link href="/faq" className="link-wipe text-ink">
              FAQ
            </Link>
            .
          </p>
        </div>

        <div className="lg:pt-24">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-ink p-10 text-ivory [&_:focus-visible]:outline-ivory md:p-14">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-ink">
                  <CheckIcon size={26} />
                </span>
                <p className="mt-6 text-[1.8rem] font-medium leading-tight">Thank you, {name.split(' ')[0]}.</p>
                <p className="mt-5 max-w-sm text-bone">Your message is with us. We will reply to {email}.</p>
                <Button
                  variant="outline-light"
                  className="mt-10"
                  onClick={() => {
                    setSent(false)
                    setForm({ ...form, message: '' })
                  }}
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={submit} noValidate className="space-y-4 bg-bone/70 p-6 md:p-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" required autoComplete="name" value={name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
                  <Field label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
                </div>
                <Select label="About" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
                <TextArea label="Your message" required rows={7} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={errors.message} />
                {error && !Object.keys(errors).length ? (
                  <p role="alert" className="text-sm text-error">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" size="lg" loading={busy} arrow>
                  Send message
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
