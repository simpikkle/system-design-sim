import type { Scenario } from './types'

export const SCENARIOS: Scenario[] = [
  {
    id: 'launch-day',
    name: 'Launch Day',
    description: 'A steady trickle of early adopters explodes into a front-page spike. Traffic ramps 40 → 3,000 req/s over 30s.',
    durationSec: 30,
    trafficAt: (t, duration) => {
      const eased = 1 - Math.cos((Math.min(t, duration) / duration) * (Math.PI / 2))
      return 40 + eased * 2960
    },
    thresholds: {
      maxP99LatencyMs: 500,
      maxErrorRatePct: 2,
      warnP99LatencyMs: 300,
      warnErrorRatePct: 0.5,
    },
  },
]
