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
  const dead = status === 'critical'
  return (
    <div
      className="w-[220px] rounded-xl border bg-surface-1 px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors"
      style={{
        borderColor: selected
          ? 'var(--color-accent)'
          : dead
            ? 'var(--color-critical)'
            : status
              ? `color-mix(in srgb, ${STATUS_COLOR[status]} 35%, var(--color-surface-border))`
              : 'var(--color-surface-border)',
        boxShadow: selected ? '0 0 0 3px var(--color-accent-dim)' : dead ? '0 0 0 2px var(--color-critical-dim)' : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent">
          <span className="block h-5 w-5">{icon}</span>
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-base font-medium leading-tight text-ink">{name}</div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">{kindLabel}</div>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
