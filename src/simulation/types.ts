export type NodeKind = 'client' | 'loadBalancer' | 'server' | 'db'

export type Size = 'small' | 'medium' | 'large'

export type Status = 'good' | 'warning' | 'critical'

export interface GraphNode {
  id: string
  kind: NodeKind
  name: string
  size?: Size
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  /** sim time (seconds) this edge was wired in mid-run — undefined means it ramps in instantly at weight 1 */
  addedAtSimTime?: number
}

export interface SizeSpec {
  capacity: number
  latencyMs: number
  costPerHour: number
}

export interface NodeStat {
  incomingRps: number
  acceptedRps: number
  utilization: number
  latencyMs: number
  status: Status
}

export interface EdgeStat {
  rps: number
  status: Status
}

export interface SimSnapshot {
  tSec: number
  offeredRps: number
  servedRps: number
  errorRatePct: number
  p50LatencyMs: number
  p99LatencyMs: number
  nodeStats: Record<string, NodeStat>
  edgeStats: Record<string, EdgeStat>
}

export type Verdict = 'green' | 'yellow' | 'red'

export interface ScoreResult {
  verdict: Verdict
  reasons: string[]
}

export interface Scenario {
  id: string
  name: string
  description: string
  durationSec: number
  /** requests/sec offered by the client at time t (0..durationSec) */
  trafficAt: (tSec: number, durationSec: number) => number
  /** seed values for the user-editable traffic controls; falls back to trafficAt if absent */
  baseRps?: number
  peakRps?: number
  thresholds: {
    maxP99LatencyMs: number
    maxErrorRatePct: number
    warnP99LatencyMs: number
    warnErrorRatePct: number
  }
}
