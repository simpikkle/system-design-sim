import type { ReactNode } from 'react'
import type { Status } from '../../simulation/types'
import { STATUS_COLOR } from '../statusColors'

interface NodeShellProps {
  icon: ReactNode
  name: string
  kindLabel: string
  selected?: boolean
  status?: Status
  children?: ReactNode
}

export function NodeShell({ icon, name, kindLabel, selected, status, children }: NodeShellProps) {
  const glow = status === 'critical' ? 'animate-pulse' : ''
  return (
    <div
      className={`w-[190px] rounded-xl border bg-surface-1 px-3.5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors ${glow}`}
      style={{
        borderColor: selected
          ? 'var(--color-accent)'
          : status
            ? `color-mix(in srgb, ${STATUS_COLOR[status]} 35%, var(--color-surface-border))`
            : 'var(--color-surface-border)',
        boxShadow: selected ? '0 0 0 3px var(--color-accent-dim)' : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent">
          <span className="block h-4 w-4">{icon}</span>
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-[13px] font-medium leading-tight text-ink">{name}</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-faint">{kindLabel}</div>
        </div>
      </div>
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  )
}
