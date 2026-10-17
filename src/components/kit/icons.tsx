import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 20, children, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      {children}
    </svg>
  )
}

export const SearchIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Svg>
)
export const UserIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M4.5 20c1.3-3.6 4.2-5.4 7.5-5.4s6.2 1.8 7.5 5.4" />
  </Svg>
)
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.4-7.5-10.1A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.3C19.5 15.6 12 20 12 20z" />
  </Svg>
)
export const BagIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5.5 8.5h13l-1 11.5h-11z" />
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
  </Svg>
)
export const PlusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)
export const MinusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)
export const CheckIcon = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)
export const ArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
)
export const ArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Svg>
)
export const ArrowUp = (p: P) => (
  <Svg {...p}>
    <path d="M12 20V5M6 11l6-6 6 6" />
  </Svg>
)
export const ChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)
export const TruckIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 6.5h11v9H3zM14 10h3.5l3 3v2.5H14" />
    <circle cx="7" cy="17.5" r="1.6" />
    <circle cx="17" cy="17.5" r="1.6" />
  </Svg>
)
export const ReturnIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 7 5 11l4 4" />
    <path d="M5 11h9.5a4.5 4.5 0 0 1 0 9H11" />
  </Svg>
)
export const LeafIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
    <path d="M5 19 13 11" />
  </Svg>
)
export const NeedleIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 20 18.5 5.5" />
    <ellipse cx="19.2" cy="4.8" rx="1.4" ry="0.8" transform="rotate(-45 19.2 4.8)" />
    <path d="M7 14c3 1 6-1 7-4" strokeDasharray="1.5 2" />
  </Svg>
)
export const SparkIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </Svg>
)
export const ShieldIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
)
export const MailIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
)
export const PhoneIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
  </Svg>
)
/** A chat bubble with a handset: the "message us" mark of the floating WhatsApp button. */
export const ChatPhoneIcon = (p: P) => (
  <Svg strokeWidth={1.7} {...p}>
    <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z" />
    <path transform="translate(6.9 6.9) scale(0.43)" fill="currentColor" stroke="none" d="M6.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
  </Svg>
)
export const PinIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
)
export const HelpIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6M12 16.8v.2" />
  </Svg>
)
export const RulerIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
    <path d="M6.5 8v3M10.5 8v4M14.5 8v3M18.5 8v4" />
  </Svg>
)
export const StarIcon = (p: P) => (
  <Svg {...p}>
    <path d="m12 3.5 2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.8l-5.4 2.9 1.2-5.9L3.4 9.7l6-.7z" />
  </Svg>
)
export const InstagramIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </Svg>
)
export const PinterestIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10.5 20.2 12.4 12M12 7.5c-2.5 0-4 1.6-4 3.6 0 1 .4 1.7 1 2M11.5 13.6c1.5.6 4.5-.3 4.5-3.2 0-1.7-1.5-3-4-3" />
  </Svg>
)
export const TiktokIcon = (p: P) => (
  <Svg {...p}>
    <path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3.5c.4 2.6 2.2 4.3 5 4.5" />
  </Svg>
)
export const XIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 4.5 19.5 19.5M19.5 4.5l-15 15" />
  </Svg>
)
export const TrashIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </Svg>
)
export const CopyIcon = (p: P) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Svg>
)
export const FilterIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Svg>
)
export const GridIcon = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </Svg>
)
export const LargeIcon = (p: P) => (
  <Svg {...p}>
    <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
  </Svg>
)
export const PackageIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </Svg>
)
export const LogoutIcon = (p: P) => (
  <Svg {...p}>
    <path d="M14 4.5H6.5v15H14M10 12h10M16.5 8.5 20 12l-3.5 3.5" />
  </Svg>
)
