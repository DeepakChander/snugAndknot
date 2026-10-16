import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/format'

type Props = Omit<ImageProps, 'fill'> & {
  className?: string
  imgClassName?: string
  /** Accepted for older call sites; the photograph no longer opens from a window as it scrolls. */
  inset?: number
  radius?: string
  parallax?: number
}

/** An editorial photograph filling its frame. (It once opened from a rounded window while scrolling.) */
export default function UnmaskImage({ className, imgClassName, inset, radius, parallax, alt, ...img }: Props) {
  void inset
  void radius
  void parallax
  return (
    <div className={cn('relative overflow-hidden bg-parchment', className)}>
      <Image alt={alt} fill className={cn('object-cover', imgClassName)} {...img} />
    </div>
  )
}
