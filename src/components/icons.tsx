type IconProps = { className?: string }

const base = 'stroke-current fill-none'

export function ClientIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" className={base} />
      <path d="M8 20h8M12 16v4" className={base} strokeLinecap="round" />
    </svg>
  )
}

export function LoadBalancerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6}>
      <circle cx="5" cy="12" r="2" className={base} />
      <circle cx="19" cy="5" r="2" className={base} />
      <circle cx="19" cy="12" r="2" className={base} />
      <circle cx="19" cy="19" r="2" className={base} />
      <path d="M7 12h4M11 12l6-6.3M11 12h6M11 12l6 6.3" className={base} strokeLinecap="round" />
    </svg>
  )
}

export function ServerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6}>
      <rect x="3" y="3.5" width="18" height="6" rx="1.2" className={base} />
      <rect x="3" y="14.5" width="18" height="6" rx="1.2" className={base} />
      <circle cx="7" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="4.2" className={base} />
      <path
        d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"
        className={base}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6}>
      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z" className={base} strokeLinejoin="round" />
    </svg>
  )
}

export function DbIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6}>
      <ellipse cx="12" cy="5.5" rx="8" ry="2.8" className={base} />
      <path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13" className={base} />
      <path d="M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8" className={base} />
    </svg>
  )
}
