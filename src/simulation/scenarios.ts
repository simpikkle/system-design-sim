import { trafficRamp } from './traffic'
import type { Scenario } from './types'

export const SCENARIOS: Scenario[] = [
  {
    id: 'launch-day',
    name: 'Launch Day',
    description: 'A steady trickle of early adopters explodes into a front-page spike.',
    durationSec: 30,
    baseRps: 40,
    peakRps: 3000,
    trafficAt: (t, duration) => trafficRamp(t, duration, 40, 3000),
    thresholds: {
      maxP99LatencyMs: 500,
      maxErrorRatePct: 2,
      warnP99LatencyMs: 300,
      warnErrorRatePct: 0.5,
    },
  },
]
