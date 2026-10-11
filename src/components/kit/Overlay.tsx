'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type TargetAndTransition } from 'motion/react'
import { lockScroll, unlockScroll } from '@/lib/motion/lenis'
import { cn } from '@/lib/format'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Traps focus inside `ref` while active, closes on Escape and restores focus on exit. */
export function useDialogBehaviour(active: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement | null
    lockScroll()
    const focusFirst = () => {
      const panel = ref.current
      if (!panel) return
      const auto = panel.querySelector<HTMLElement>('[data-autofocus]')
      ;(auto ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus({ preventScroll: true })
    }
    const raf = requestAnimationFrame(focusFirst)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      previous?.focus?.({ preventScroll: true })
    }
  }, [active, ref])
}

function usePortalTarget() {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => setEl(document.body), [])
  return el
}

const EASE = [0.16, 1, 0.3, 1] as const

type Side = 'right' | 'left' | 'bottom' | 'center' | 'top'

const panelMotion: Record<Side, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
  center: { initial: { opacity: 0, y: 30, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 20, scale: 0.98 } },
}

const panelPos: Record<Side, string> = {
  right: 'right-0 top-0 h-[100dvh] w-full max-w-[460px]',
  left: 'left-0 top-0 h-[100dvh] w-full max-w-[460px]',
  bottom: 'bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-[2rem]',
  top: 'left-0 right-0 top-0',
  center: 'left-1/2 top-1/2 w-[min(92vw,960px)] max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 rounded-[2rem]',
}

export default function Overlay({
  open,
  onClose,
  label,
  side = 'right',
  className,
  backdropClassName,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  side?: Side
  className?: string
  backdropClassName?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const target = usePortalTarget()
  useDialogBehaviour(open, ref, onClose)
  if (!target) return null
  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120]" data-chrome>
          <motion.div
            className={cn('absolute inset-0 bg-noir/55 backdrop-blur-[3px]', backdropClassName)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={onClose}
            aria-hidden
          />
          {/* `center` uses its own translate; wrap so motion's transform doesn't fight it */}
          <div className={cn('absolute', panelPos[side], side === 'center' ? '' : '')}>
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              tabIndex={-1}
              data-lenis-prevent
              className={cn('relative h-full w-full overflow-y-auto outline-none', side === 'center' && 'max-h-[90dvh] rounded-[2rem]', side === 'bottom' && 'max-h-[92dvh] rounded-t-[2rem]', className)}
              {...panelMotion[side]}
              transition={{ duration: side === 'center' ? 0.6 : 0.85, ease: EASE }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    target
  )
}

export function CloseButton({ onClick, className, label = 'Close' }: { onClick: () => void; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-cursor="hover"
      className={cn('group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-current/15 transition-colors hover:bg-current/5', className)}
    >
      <span className="absolute h-px w-4 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
      <span className="absolute h-px w-4 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-45" />
    </button>
  )
}
