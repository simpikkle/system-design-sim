import { useSimStore } from '../store/simStore'
import { STATUS_COLOR } from './statusColors'
import type { Status } from '../simulation/types'
import { Sparkline } from './Sparkline'

function severity(value: number, warn: number, max: number): Status {
  if (value > max) return 'critical'

  if (value > warn) return 'warning'

  return 'good'
}

export function TelemetryStrip() {
  const { status, displayed, history, scenario, traffic, scrub, releaseScrub } = useSimStore()
  const { thresholds } = scenario

  const errSeverity = displayed ? severity(displayed.errorRatePct, thresholds.warnErrorRatePct, thresholds.maxErrorRatePct) : 'good'
  const latSeverity = displayed ? severity(displayed.p99LatencyMs, thresholds.warnP99LatencyMs, thresholds.maxP99LatencyMs) : 'good'

  const scrubDisabled = status !== 'done'
  const progress = displayed ? displayed.tSec : 0

  return (
    <footer className="flex h-24 shrink-0 items-center gap-8 border-t border-surface-border bg-surface-1/80 px-5">
      <Tile
        label="Offered"
        value={displayed ? Math.round(displayed.offeredRps).toLocaleString() : '—'}
        unit="req/s"
        color="var(--color-accent)"
        values={history.map((h) => h.offeredRps)}
      />
      <Tile
        label="Served"
        value={displayed ? Math.round(displayed.servedRps).toLocaleString() : '—'}
        unit="req/s"
        color="var(--color-ink-muted)"
        values={history.map((h) => h.servedRps)}
      />
      <Tile
        label="p99 Latency"
        value={displayed ? Math.round(displayed.p99LatencyMs).toString() : '—'}
        unit="ms"
        color={STATUS_COLOR[latSeverity]}
        values={history.map((h) => h.p99LatencyMs)}
      />
      <Tile
        label="Error Rate"
        value={displayed ? displayed.errorRatePct.toFixed(1) : '—'}
        unit="%"
        color={STATUS_COLOR[errSeverity]}
        values={history.map((h) => h.errorRatePct)}
      />

      <div className="ml-auto flex min-w-[280px] flex-col gap-1.5">
        <div className="flex justify-between font-mono text-[10px] text-ink-faint">
          <span>timeline</span>
          <span>
            {progress.toFixed(1)}s / {traffic.durationSec}s
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={traffic.durationSec}
          step={0.1}
          value={progress}
          disabled={scrubDisabled}
          onChange={(e) => scrub(Number(e.target.value))}
          onMouseUp={releaseScrub}
          onTouchEnd={releaseScrub}
          className="accent-[color:var(--color-accent)] disabled:opacity-30"
        />
      </div>
    </footer>
  )
}

function Tile({ label, value, unit, color, values }: { label: string; value: string; unit: string; color: string; values: number[] }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</div>
        <div className="font-mono text-xl font-medium leading-none" style={{ color }}>
          {value}
          <span className="ml-1 text-[11px] text-ink-faint">{unit}</span>
        </div>
      </div>
      <Sparkline values={values} color={color} />
    </div>
  )
}
