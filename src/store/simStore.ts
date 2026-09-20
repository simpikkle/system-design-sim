import { create } from 'zustand'
import { score, simulateAt } from '../simulation/engine'
import { SCENARIOS } from '../simulation/scenarios'
import { trafficRamp } from '../simulation/traffic'
import type { GraphEdge, GraphNode, Scenario, ScoreResult, SimSnapshot } from '../simulation/types'

export const SIM_SPEED = 2.5 // sim-seconds per wall-clock second

export const HISTORY_SAMPLE_SEC = 0.2

export type RunStatus = 'idle' | 'running' | 'paused' | 'done'

interface RunGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface TrafficConfig {
  baseRps: number
  peakRps: number
  durationSec: number
}

function buildActiveScenario(scenario: Scenario, traffic: TrafficConfig): Scenario {
  return {
    ...scenario,
    durationSec: traffic.durationSec,
    trafficAt: (t, d) => trafficRamp(t, d, traffic.baseRps, traffic.peakRps),
  }
}

interface SimState {
  scenario: Scenario
  traffic: TrafficConfig
  activeScenario: Scenario | null
  status: RunStatus
  simTime: number
  history: SimSnapshot[]
  displayed: SimSnapshot | null
  scoreResult: ScoreResult | null
  runGraph: RunGraph | null
  isScrubbing: boolean

  setTraffic: (patch: Partial<TrafficConfig>) => void
  start: (nodes: GraphNode[], edges: GraphEdge[]) => void
  pause: () => void
  resume: (nodes: GraphNode[], edges: GraphEdge[]) => void
  advance: (dtWallSec: number) => void
  scrub: (tSec: number) => void
  releaseScrub: () => void
  reset: () => void
}

const initialScenario = SCENARIOS[0]

export const useSimStore = create<SimState>((set, get) => ({
  scenario: initialScenario,
  traffic: {
    baseRps: initialScenario.baseRps ?? 40,
    peakRps: initialScenario.peakRps ?? 1000,
    durationSec: initialScenario.durationSec,
  },
  activeScenario: null,
  status: 'idle',
  simTime: 0,
  history: [],
  displayed: null,
  scoreResult: null,
  runGraph: null,
  isScrubbing: false,

  setTraffic: (patch) => set({ traffic: { ...get().traffic, ...patch } }),

  start: (nodes, edges) => {
    const activeScenario = buildActiveScenario(get().scenario, get().traffic)
    const runGraph = { nodes, edges }
    const first = simulateAt(nodes, edges, activeScenario, 0)
    set({ status: 'running', simTime: 0, history: [first], displayed: first, scoreResult: null, runGraph, activeScenario, isScrubbing: false })
  },

  pause: () => {
    if (get().status === 'running') set({ status: 'paused' })
  },

  resume: (nodes, edges) => {
    if (get().status !== 'paused') return
    set({ runGraph: { nodes, edges }, status: 'running' })
  },

  advance: (dtWallSec) => {
    const { status, runGraph, activeScenario, simTime, history } = get()

    if (status !== 'running' || !runGraph || !activeScenario) return
    const nextTime = Math.min(activeScenario.durationSec, simTime + dtWallSec * SIM_SPEED)
    const snapshot = simulateAt(runGraph.nodes, runGraph.edges, activeScenario, nextTime)

    const lastSampled = history[history.length - 1]

    const nextHistory =
      !lastSampled || nextTime - lastSampled.tSec >= HISTORY_SAMPLE_SEC || nextTime >= activeScenario.durationSec
        ? [...history, snapshot]
        : history

    if (nextTime >= activeScenario.durationSec) {
      set({
        simTime: nextTime,
        displayed: snapshot,
        history: nextHistory,
        status: 'done',
        scoreResult: score(nextHistory, activeScenario),
      })
    } else {
      set({ simTime: nextTime, displayed: snapshot, history: nextHistory })
    }
  },

  scrub: (tSec) => {
    const { runGraph, activeScenario } = get()

    if (!runGraph || !activeScenario) return
    set({ isScrubbing: true, displayed: simulateAt(runGraph.nodes, runGraph.edges, activeScenario, tSec) })
  },

  releaseScrub: () => set({ isScrubbing: false }),

  reset: () =>
    set({ status: 'idle', simTime: 0, history: [], displayed: null, scoreResult: null, runGraph: null, activeScenario: null, isScrubbing: false }),
}))
