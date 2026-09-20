import { useEffect, useRef } from 'react'
import { useSimStore } from '../store/simStore'

/** Drives the sim clock forward every animation frame while a run is active. */
export function useSimulationClock() {
  const status = useSimStore((s) => s.status)
  const advance = useSimStore((s) => s.advance)
  const isScrubbing = useSimStore((s) => s.isScrubbing)
  const lastFrame = useRef<number | null>(null)

  useEffect(() => {
    if (status !== 'running') {
      lastFrame.current = null
      return
    }
    let raf = 0
    const loop = (now: number) => {
      if (lastFrame.current !== null && !isScrubbing) {
        advance((now - lastFrame.current) / 1000)
      }
      lastFrame.current = now
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [status, advance, isScrubbing])
}
