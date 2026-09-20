import type { Status } from '../simulation/types'
import { STATUS_COLOR, STATUS_GLYPH, STATUS_LABEL } from './statusColors'

interface UtilizationBarProps {
  utilization: number
  status: Status
  latencyMs: number
}

export function UtilizationBar({ utilization, status, latencyMs }: UtilizationBarProps) {
  const pct = Math.min(1, utilization) * 100
  const color = STATUS_COLOR[status]
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span className="flex items-center gap-1" style={{ color }}>
          <span aria-hidden>{STATUS_GLYPH[status]}</span>
          {STATUS_LABEL[status]}
        </span>
        <span className="font-mono">{Math.round(utilization * 100)}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-[width] duration-150 ease-linear"
          style={{ width: `${pct}%`, background: color, boxShadow: utilization > 1 ? `0 0 8px ${color}` : undefined }}
        />
      </div>
      <div className="mt-1.5 font-mono text-xs text-ink-muted">{Math.round(latencyMs)}ms</div>
    </div>
  )
}
