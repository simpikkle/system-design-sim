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

const chain = (): { nodes: GraphNode[]; edges: GraphEdge[] } => ({
  nodes: [
    { id: 'c', kind: 'client', name: 'Client' },
    { id: 'lb', kind: 'loadBalancer', name: 'LB' },
    { id: 's1', kind: 'server', name: 'Server 1', size: 'small' },
    { id: 's2', kind: 'server', name: 'Server 2', size: 'small' },
    { id: 'db', kind: 'db', name: 'DB', size: 'small' },
  ],
  edges: [
    { id: 'e1', source: 'c', target: 'lb' },
    { id: 'e2', source: 'lb', target: 's1' },
    { id: 'e3', source: 'lb', target: 's2' },
    { id: 'e4', source: 's1', target: 'db' },
    { id: 'e5', source: 's2', target: 'db' },
  ],
})

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

  it('drops traffic and flags critical once a server exceeds capacity', () => {
    const { nodes, edges } = chain()
    // small server capacity is 120 each => 240 total; push well past it
    const snap = simulateAt(nodes, edges, flatScenario(1000), 0)
    expect(snap.errorRatePct).toBeGreaterThan(50)
    expect(snap.nodeStats.s1.status).toBe('critical')
  })

  it('raises latency as utilization approaches capacity', () => {
    const { nodes, edges } = chain()
    const low = simulateAt(nodes, edges, flatScenario(20), 0)
    const high = simulateAt(nodes, edges, flatScenario(220), 0)
    expect(high.nodeStats.s1.latencyMs).toBeGreaterThan(low.nodeStats.s1.latencyMs)
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
