import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import { create } from 'zustand'
import { defaultSizeFor, isValidConnection } from '../simulation/specs'
import { useSimStore } from './simStore'
import type { GraphEdge, GraphNode, NodeKind, Size } from '../simulation/types'

export interface NodeData extends Record<string, unknown> {
  kind: NodeKind
  name: string
  size?: Size
}

export interface EdgeData extends Record<string, unknown> {
  /** sim time (seconds) this edge was wired in mid-run — undefined for edges present since the design started */
  addedAtSimTime?: number
}

export type FlowNode = Node<NodeData>
export type FlowEdge = Edge<EdgeData>

let nodeSeq = 0
const nextId = (kind: string) => `${kind}-${++nodeSeq}`

const initialNodes: FlowNode[] = [
  { id: 'client-0', type: 'client', position: { x: 40, y: 220 }, data: { kind: 'client', name: 'Client' }, deletable: false },
  { id: 'lb-0', type: 'loadBalancer', position: { x: 300, y: 220 }, data: { kind: 'loadBalancer', name: 'Load Balancer' } },
  { id: 'server-0', type: 'server', position: { x: 580, y: 100 }, data: { kind: 'server', name: 'Server A', size: 'small' } },
  { id: 'db-0', type: 'db', position: { x: 860, y: 100 }, data: { kind: 'db', name: 'Primary DB', size: 'small' } },
]

const initialEdges: FlowEdge[] = [
  { id: 'e-client-lb', source: 'client-0', target: 'lb-0', type: 'traffic' },
  { id: 'e-lb-server0', source: 'lb-0', target: 'server-0', type: 'traffic' },
  { id: 'e-server0-db', source: 'server-0', target: 'db-0', type: 'traffic' },
]

interface GraphState {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNodeId: string | null
  locked: boolean
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void
  updateNodeData: (id: string, patch: Partial<NodeData>) => void
  removeNode: (id: string) => void
  setSelectedNodeId: (id: string | null) => void
  setLocked: (locked: boolean) => void
  resetGraph: () => void
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  locked: false,

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) => {
    const { nodes, edges } = get()
    const source = nodes.find((n) => n.id === connection.source)
    const target = nodes.find((n) => n.id === connection.target)
    if (!source || !target) return
    if (!isValidConnection(source.data.kind, target.data.kind)) return
    const simStatus = useSimStore.getState().status
    const addedAtSimTime = simStatus === 'paused' ? useSimStore.getState().simTime : undefined
    const newEdge: FlowEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}`,
      type: 'traffic',
      data: { addedAtSimTime },
    }
    set({ edges: addEdge(newEdge, edges) })
  },

  addNode: (kind, position) => {
    const id = nextId(kind)
    const name = `${kind === 'loadBalancer' ? 'Load Balancer' : kind[0].toUpperCase() + kind.slice(1)} ${nodeSeq}`
    const data: NodeData = { kind, name, ...(kind === 'server' || kind === 'db' ? { size: defaultSizeFor(kind) } : {}) }
    set({ nodes: [...get().nodes, { id, type: kind, position, data }] })
  },

  updateNodeData: (id, patch) =>
    set({
      nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    }),

  removeNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setLocked: (locked) => set({ locked }),

  resetGraph: () => set({ nodes: initialNodes, edges: initialEdges, selectedNodeId: null }),
}))

export function toSimGraph(nodes: FlowNode[], edges: FlowEdge[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return {
    nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, name: n.data.name, size: n.data.size })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, addedAtSimTime: e.data?.addedAtSimTime })),
  }
}
