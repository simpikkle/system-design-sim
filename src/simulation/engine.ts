import { CLIENT_LATENCY_MS, LB_LATENCY_MS, SIZE_SPECS } from './specs'
import type {
  EdgeStat,
  GraphEdge,
  GraphNode,
  NodeStat,
  Scenario,
  ScoreResult,
  SimSnapshot,
  Status,
  Verdict,
} from './types'

const WARN_UTILIZATION = 0.8

const DEAD_UTILIZATION = 1

const MAX_UTILIZATION_FOR_LATENCY = 0.98

/** Newly wired edges ramp from 0 to their fair share over this many sim-seconds, instead of taking it instantly. */
const EDGE_RAMP_IN_SEC = 4

/** Fraction of a node's accepted traffic each outgoing edge currently carries, summing to 1. */
function edgeFanOutWeights(outEdges: GraphEdge[], tSec: number): number[] {
  const weights = outEdges.map((e) => {
    if (e.addedAtSimTime == null) return 1
    const dt = tSec - e.addedAtSimTime

    if (dt <= 0) return 0

    if (dt >= EDGE_RAMP_IN_SEC) return 1

    return dt / EDGE_RAMP_IN_SEC
  })

  const total = weights.reduce((s, w) => s + w, 0)

  if (total <= 0) return outEdges.map(() => 1 / outEdges.length)

  return weights.map((w) => w / total)
}

function statusForUtilization(utilization: number): Status {
  if (utilization >= DEAD_UTILIZATION) return 'critical'

  if (utilization >= WARN_UTILIZATION) return 'warning'

  return 'good'
}

/** Kahn's algorithm — small graphs, but keeps the engine generic as more components arrive. */
function topoOrder(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const inDegree = new Map(nodes.map((n) => [n.id, 0]))
  const outEdges = new Map<string, GraphEdge[]>(nodes.map((n) => [n.id, []]))

  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    outEdges.get(e.source)?.push(e)
  }

  const queue: string[] = []

  for (const n of nodes) {
    if ((inDegree.get(n.id) ?? 0) === 0) queue.push(n.id)
  }

  const order: GraphNode[] = []

  while (queue.length) {
    const id = queue.shift()!
    order.push(byId.get(id)!)

    for (const e of outEdges.get(id) ?? []) {
      inDegree.set(e.target, (inDegree.get(e.target) ?? 0) - 1)

      if (inDegree.get(e.target) === 0) queue.push(e.target)
    }
  }

  return order
}

interface LatencySample {
  rps: number
  latencyMs: number
}

function weightedPercentile(samples: LatencySample[], p: number): number {
  const total = samples.reduce((s, x) => s + x.rps, 0)

  if (total <= 0) return 0
  const sorted = [...samples].sort((a, b) => a.latencyMs - b.latencyMs)
  const target = total * p
  let cumulative = 0

  for (const s of sorted) {
    cumulative += s.rps

    if (cumulative >= target) return s.latencyMs
  }

  return sorted[sorted.length - 1]?.latencyMs ?? 0
}

export function simulateAt(
  nodes: GraphNode[],
  edges: GraphEdge[],
  scenario: Scenario,
  tSec: number,
): SimSnapshot {
  const order = topoOrder(nodes, edges)
  const inEdgesByTarget = new Map<string, GraphEdge[]>(nodes.map((n) => [n.id, []]))
  const outEdgesBySource = new Map<string, GraphEdge[]>(nodes.map((n) => [n.id, []]))

  for (const e of edges) {
    inEdgesByTarget.get(e.target)?.push(e)
    outEdgesBySource.get(e.source)?.push(e)
  }

  const edgeRps = new Map<string, number>()
  const edgeFraction = new Map<string, number>()
  const nodeStats = new Map<string, NodeStat>()
  const samplesBefore = new Map<string, LatencySample[]>()
  const offeredRps = scenario.trafficAt(tSec, scenario.durationSec)

  for (const node of order) {
    const inEdges = inEdgesByTarget.get(node.id) ?? []
    const outEdges = outEdgesBySource.get(node.id) ?? []
    const incomingRps = node.kind === 'client' ? offeredRps : inEdges.reduce((s, e) => s + (edgeRps.get(e.id) ?? 0), 0)

    let acceptedRps = incomingRps
    let latencyMs = 0
    let utilization = 0

    if (node.kind === 'server' || node.kind === 'db') {
      const spec = SIZE_SPECS[node.kind][node.size ?? 'small']
      utilization = spec.capacity > 0 ? incomingRps / spec.capacity : 0
      // At or past capacity the node is dead, not degraded: it forwards nothing further.
      acceptedRps = utilization >= DEAD_UTILIZATION ? 0 : incomingRps
      const clamped = Math.min(utilization, MAX_UTILIZATION_FOR_LATENCY)
      latencyMs = spec.latencyMs / Math.max(0.02, 1 - clamped)
    } else if (node.kind === 'loadBalancer') {
      latencyMs = LB_LATENCY_MS
    } else {
      latencyMs = CLIENT_LATENCY_MS
    }

    nodeStats.set(node.id, {
      incomingRps,
      acceptedRps,
      utilization,
      latencyMs,
      status: statusForUtilization(utilization),
    })

    if (outEdges.length > 0) {
      const weights = edgeFanOutWeights(outEdges, tSec)
      outEdges.forEach((e, i) => {
        edgeFraction.set(e.id, weights[i])
        edgeRps.set(e.id, acceptedRps * weights[i])
      })
    }

    const survival = incomingRps > 0 ? acceptedRps / incomingRps : 1

    const inbound: LatencySample[] = inEdges.flatMap((e) => {
      const fraction = edgeFraction.get(e.id) ?? 1

      return (samplesBefore.get(e.source) ?? []).map((s) => ({ rps: s.rps * fraction, latencyMs: s.latencyMs }))
    })

    const base: LatencySample[] = node.kind === 'client' ? [{ rps: offeredRps, latencyMs: 0 }] : inbound
    samplesBefore.set(
      node.id,
      base.map((s) => ({ rps: s.rps * survival, latencyMs: s.latencyMs + latencyMs })),
    )
  }

  const leaves = nodes.filter((n) => (outEdgesBySource.get(n.id) ?? []).length === 0)
  const leafSamples = leaves.flatMap((n) => samplesBefore.get(n.id) ?? [])
  const servedRps = leaves.reduce((s, n) => s + (nodeStats.get(n.id)?.acceptedRps ?? 0), 0)
  const errorRatePct = offeredRps > 0 ? Math.max(0, 1 - servedRps / offeredRps) * 100 : 0

  // An edge is colored by what its source already knows, not by the fate awaiting it downstream.
  const edgeStats: Record<string, EdgeStat> = {}

  for (const e of edges) {
    const rps = edgeRps.get(e.id) ?? 0
    const sourceStat = nodeStats.get(e.source)
    edgeStats[e.id] = { rps, status: sourceStat?.status ?? 'good' }
  }

  return {
    tSec,
    offeredRps,
    servedRps,
    errorRatePct,
    p50LatencyMs: weightedPercentile(leafSamples, 0.5),
    p99LatencyMs: weightedPercentile(leafSamples, 0.99),
    nodeStats: Object.fromEntries(nodeStats),
    edgeStats,
  }
}

/** The verdict this instant would earn on its own — used for the live beacon while a run is in flight. */
export function snapshotVerdict(snap: SimSnapshot, scenario: Scenario): Verdict {
  const { maxP99LatencyMs, maxErrorRatePct, warnP99LatencyMs, warnErrorRatePct } = scenario.thresholds

  if (snap.errorRatePct > maxErrorRatePct || snap.p99LatencyMs > maxP99LatencyMs) return 'red'

  if (snap.errorRatePct > warnErrorRatePct || snap.p99LatencyMs > warnP99LatencyMs) return 'yellow'

  return 'green'
}

export function score(history: SimSnapshot[], scenario: Scenario): ScoreResult {
  if (history.length === 0) return { verdict: 'red', reasons: ['No simulation data.'] }
  const peakP99 = Math.max(...history.map((h) => h.p99LatencyMs))
  const peakError = Math.max(...history.map((h) => h.errorRatePct))
  const { maxP99LatencyMs, maxErrorRatePct, warnP99LatencyMs, warnErrorRatePct } = scenario.thresholds

  const reasons: string[] = []
  let verdict: ScoreResult['verdict'] = 'green'

  if (peakError > maxErrorRatePct || peakP99 > maxP99LatencyMs) {
    verdict = 'red'

    if (peakError > maxErrorRatePct) reasons.push(`peak error rate ${peakError.toFixed(1)}% exceeds ${maxErrorRatePct}% limit`)

    if (peakP99 > maxP99LatencyMs) reasons.push(`peak p99 latency ${peakP99.toFixed(0)}ms exceeds ${maxP99LatencyMs}ms limit`)
  } else if (peakError > warnErrorRatePct || peakP99 > warnP99LatencyMs) {
    verdict = 'yellow'

    if (peakError > warnErrorRatePct) reasons.push(`peak error rate ${peakError.toFixed(1)}% is close to the ${maxErrorRatePct}% limit`)

    if (peakP99 > warnP99LatencyMs) reasons.push(`peak p99 latency ${peakP99.toFixed(0)}ms is close to the ${maxP99LatencyMs}ms limit`)
  } else {
    reasons.push(`peak p99 latency ${peakP99.toFixed(0)}ms, peak error rate ${peakError.toFixed(1)}% — within budget`)
  }

  return { verdict, reasons }
}
