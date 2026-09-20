import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useSimStore } from '../store/simStore'
import { snapshotVerdict } from '../simulation/engine'
import type { Verdict } from '../simulation/types'

const VERDICT_COLOR: Record<Verdict, string> = {
  green: 'var(--color-good)',
  yellow: 'var(--color-warning)',
  red: 'var(--color-critical)',
}

const VERDICT_LABEL: Record<Verdict, string> = { green: 'PASS', yellow: 'MARGINAL', red: 'FAIL' }

export function VerdictBeacon() {
  const status = useSimStore((s) => s.status)
  const displayed = useSimStore((s) => s.displayed)
  const scenario = useSimStore((s) => s.scenario)
  const scoreResult = useSimStore((s) => s.scoreResult)
  const beaconRef = useRef<HTMLSpanElement>(null)

  const liveVerdict: Verdict | null = displayed ? snapshotVerdict(displayed, scenario) : null
  const verdict = status === 'done' ? scoreResult?.verdict ?? null : liveVerdict
  const color = verdict ? VERDICT_COLOR[verdict] : 'var(--color-ink-faint)'

  useEffect(() => {
    if (status !== 'done' || !beaconRef.current) return
    gsap
      .timeline()
      .to(beaconRef.current, { scale: 1.5, duration: 0.18, ease: 'power2.out' })
      .to(beaconRef.current, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)' })
  }, [status])

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-8 w-8 items-center justify-center">
        {status === 'running' && (
          <span className="absolute h-full w-full animate-ping rounded-full" style={{ background: color, opacity: 0.35 }} />
        )}
        <span
          ref={beaconRef}
          className="relative h-4 w-4 rounded-full transition-colors duration-300"
          style={{ background: color, boxShadow: verdict ? `0 0 12px ${color}` : undefined }}
        />
      </div>
      <div className="leading-tight">
        <div className="font-display text-[13px] font-semibold tracking-wide" style={{ color: verdict ? color : 'var(--color-ink-faint)' }}>
          {status === 'idle' ? 'STANDING BY' : status === 'paused' ? 'PAUSED' : verdict ? VERDICT_LABEL[verdict] : 'READING…'}
        </div>
        <div className="max-w-[260px] truncate font-mono text-[10px] text-ink-faint">
          {status === 'done' && scoreResult
            ? scoreResult.reasons[0]
            : status === 'running'
              ? 'simulation in progress'
              : status === 'paused'
                ? 'edit the design, then resume'
                : 'run the scenario to score this design'}
        </div>
      </div>
    </div>
  )
}
