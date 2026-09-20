import { describe, expect, it } from 'vitest'
import { simulateAt, score } from './engine'
import type { GraphEdge, GraphNode, Scenario } from './types'

const flatScenario = (rps: number): Scenario => ({
  id: 'flat',
  name: 'flat',
  description: '',
  durationSec: 10,
  trafficAt: () => rps,
  thresholds: { maxP99LatencyMs: 500, maxErrorRatePct: 2, warnP99LatencyMs: 300, warnErrorRatePct: 0.5 },
})

const chain = () => {
  const nodes: GraphNode[] = [
    { id: 'c', kind: 'client', name: 'Client' },
    { id: 'lb', kind: 'loadBalancer', name: 'LB' },
    { id: 's1', kind: 'server', name: 'Server 1', size: 'small' },
    { id: 's2', kind: 'server', name: 'Server 2', size: 'small' },
    { id: 'db', kind: 'db', name: 'DB', size: 'small' },
  ]

  const edges: GraphEdge[] = [
    { id: 'e1', source: 'c', target: 'lb' },
    { id: 'e2', source: 'lb', target: 's1' },
    { id: 'e3', source: 'lb', target: 's2' },
    { id: 'e4', source: 's1', target: 'db' },
    { id: 'e5', source: 's2', target: 'db' },
  ]

  return { nodes, edges }
}

describe('simulateAt', () => {
  it('splits load evenly across servers behind a round-robin LB', () => {
    const { nodes, edges } = chain()
    const snap = simulateAt(nodes, edges, flatScenario(100), 0)
    expect(snap.nodeStats.s1.incomingRps).toBeCloseTo(50)
    expect(snap.nodeStats.s2.incomingRps).toBeCloseTo(50)
  })

  it('reports zero errors and low latency well under capacity', () => {
    const { nodes, edges } = chain()
    const snap = simulateAt(nodes, edges, flatScenario(20), 0)
    expect(snap.errorRatePct).toBeCloseTo(0)
    expect(snap.nodeStats.s1.status).toBe('good')
  })

  it('kills a server once demand exceeds capacity — no partial throughput leaks past it', () => {
    const { nodes, edges } = chain()
    // small server capacity is 120 each => 240 total; push well past it
    const snap = simulateAt(nodes, edges, flatScenario(1000), 0)
    expect(snap.nodeStats.s1.status).toBe('critical')
    expect(snap.nodeStats.s1.acceptedRps).toBe(0)
    expect(snap.errorRatePct).toBeCloseTo(100)
  })

  it('colors an edge by what its source already knows, not by the target it has not reached yet', () => {
    const { nodes, edges } = chain()
    // s1 dies under this load; the edge feeding it (source = healthy LB) must still read as unknown/good —
    // only the edge leaving the dead server should flip to critical.
    const snap = simulateAt(nodes, edges, flatScenario(1000), 0)
    expect(snap.nodeStats.s1.status).toBe('critical')
    expect(snap.edgeStats.e2.status).toBe('good') // lb -> s1
    expect(snap.edgeStats.e4.status).toBe('critical') // s1 -> db
  })

  it('raises latency as utilization approaches capacity', () => {
    const { nodes, edges } = chain()
    const low = simulateAt(nodes, edges, flatScenario(20), 0)
    const high = simulateAt(nodes, edges, flatScenario(220), 0)
    expect(high.nodeStats.s1.latencyMs).toBeGreaterThan(low.nodeStats.s1.latencyMs)
  })

  it('ramps a newly wired edge in gradually instead of an instant fair share', () => {
    const { nodes, edges } = chain()
    const rampedEdges = edges.map((e) => (e.id === 'e3' ? { ...e, addedAtSimTime: 5 } : e))

    const atConnect = simulateAt(nodes, rampedEdges, flatScenario(100), 5)
    expect(atConnect.nodeStats.s2.incomingRps).toBeCloseTo(0)
    expect(atConnect.nodeStats.s1.incomingRps).toBeCloseTo(100)

    const midRamp = simulateAt(nodes, rampedEdges, flatScenario(100), 7)
    expect(midRamp.nodeStats.s2.incomingRps).toBeGreaterThan(0)
    expect(midRamp.nodeStats.s2.incomingRps).toBeLessThan(midRamp.nodeStats.s1.incomingRps)

    const afterRamp = simulateAt(nodes, rampedEdges, flatScenario(100), 9)
    expect(afterRamp.nodeStats.s1.incomingRps).toBeCloseTo(50)
    expect(afterRamp.nodeStats.s2.incomingRps).toBeCloseTo(50)
  })
})

describe('score', () => {
  it('scores green when comfortably within thresholds', () => {
    const { nodes, edges } = chain()
    const scenario = flatScenario(20)
    const history = [simulateAt(nodes, edges, scenario, 0)]
    expect(score(history, scenario).verdict).toBe('green')
  })

  it('scores red when overloaded', () => {
    const { nodes, edges } = chain()
    const scenario = flatScenario(1000)
    const history = [simulateAt(nodes, edges, scenario, 0)]
    expect(score(history, scenario).verdict).toBe('red')
  })
})
