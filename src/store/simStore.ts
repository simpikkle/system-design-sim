import { create } from 'zustand'
import { score, simulateAt } from '../simulation/engine'
import { SCENARIOS } from '../simulation/scenarios'
import type { GraphEdge, GraphNode, Scenario, ScoreResult, SimSnapshot } from '../simulation/types'

export const SIM_SPEED = 2.5 // sim-seconds per wall-clock second
export const HISTORY_SAMPLE_SEC = 0.2

export type RunStatus = 'idle' | 'running' | 'done'

interface RunGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface SimState {
  scenario: Scenario
  status: RunStatus
  simTime: number
  history: SimSnapshot[]
  displayed: SimSnapshot | null
  scoreResult: ScoreResult | null
  runGraph: RunGraph | null
  isScrubbing: boolean

  start: (nodes: GraphNode[], edges: GraphEdge[]) => void
  advance: (dtWallSec: number) => void
  scrub: (tSec: number) => void
  releaseScrub: () => void
  reset: () => void
}

export const useSimStore = create<SimState>((set, get) => ({
  scenario: SCENARIOS[0],
  status: 'idle',
  simTime: 0,
  history: [],
  displayed: null,
  scoreResult: null,
  runGraph: null,
  isScrubbing: false,

  start: (nodes, edges) => {
    const runGraph = { nodes, edges }
    const first = simulateAt(nodes, edges, get().scenario, 0)
    set({ status: 'running', simTime: 0, history: [first], displayed: first, scoreResult: null, runGraph, isScrubbing: false })
  },

  advance: (dtWallSec) => {
    const { status, runGraph, scenario, simTime, history } = get()
    if (status !== 'running' || !runGraph) return
    const nextTime = Math.min(scenario.durationSec, simTime + dtWallSec * SIM_SPEED)
    const snapshot = simulateAt(runGraph.nodes, runGraph.edges, scenario, nextTime)

    const lastSampled = history[history.length - 1]
    const nextHistory =
      !lastSampled || nextTime - lastSampled.tSec >= HISTORY_SAMPLE_SEC || nextTime >= scenario.durationSec
        ? [...history, snapshot]
        : history

    if (nextTime >= scenario.durationSec) {
      set({
        simTime: nextTime,
        displayed: snapshot,
        history: nextHistory,
        status: 'done',
        scoreResult: score(nextHistory, scenario),
      })
    } else {
      set({ simTime: nextTime, displayed: snapshot, history: nextHistory })
    }
  },

  scrub: (tSec) => {
    const { runGraph, scenario } = get()
    if (!runGraph) return
    set({ isScrubbing: true, displayed: simulateAt(runGraph.nodes, runGraph.edges, scenario, tSec) })
  },

  releaseScrub: () => set({ isScrubbing: false }),

  reset: () => set({ status: 'idle', simTime: 0, history: [], displayed: null, scoreResult: null, runGraph: null, isScrubbing: false }),
}))
