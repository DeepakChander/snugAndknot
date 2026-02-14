'use client'

import { motion } from 'framer-motion'
import { fadeInUp, fadeIn, scaleIn } from '@/lib/animations'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'fade-up' | 'scale'
  delay?: number
  once?: boolean
}

export default function FadeIn({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  once = true,
}: FadeInProps) {
  const variants = {
    fade: fadeIn,
    'fade-up': fadeInUp,
    scale: scaleIn,
  }

  const selected = variants[variant]

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      variants={{
        hidden: selected.hidden,
        visible: {
          ...selected.visible,
          transition: { ...selected.visible.transition, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
