import { useCallback } from 'react'
import { Background, BackgroundVariant, Controls, ReactFlow, useReactFlow, type Connection, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useGraphStore } from '../store/graphStore'
import { useThemeStore } from '../store/themeStore'
import { useRunControls } from '../hooks/useRunControls'
import { isValidConnection as validateKinds } from '../simulation/specs'
import type { NodeKind } from '../simulation/types'
import { ClientNode } from './nodes/ClientNode'
import { LoadBalancerNode } from './nodes/LoadBalancerNode'
import { ServerNode } from './nodes/ServerNode'
import { DbNode } from './nodes/DbNode'
import { TrafficEdge } from './edges/TrafficEdge'

const nodeTypes = { client: ClientNode, loadBalancer: LoadBalancerNode, server: ServerNode, db: DbNode }
const edgeTypes = { traffic: TrafficEdge }

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId, locked } = useGraphStore()
  const { screenToFlowPosition } = useReactFlow()
  const theme = useThemeStore((s) => s.theme)
  const { status, run, pause, resume } = useRunControls()

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData('application/x-node-kind') as NodeKind
      if (!kind) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addNode(kind, position)
    },
    [screenToFlowPosition, addNode],
  )

  const checkConnection = useCallback(
    (connection: Connection | Edge) => {
      const source = nodes.find((n) => n.id === connection.source)
      const target = nodes.find((n) => n.id === connection.target)
      if (!source || !target) return false
      return validateKinds(source.data.kind, target.data.kind)
    },
    [nodes],
  )

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={checkConnection}
        onNodeClick={(_, node) => {
          if (node.data.kind === 'client') {
            if (status === 'idle') return run()
            if (status === 'running') return pause()
            if (status === 'paused') return resume()
          }
          setSelectedNodeId(node.id)
        }}
        onPaneClick={() => setSelectedNodeId(null)}
        nodesDraggable={!locked}
        nodesConnectable={!locked}
        elementsSelectable={!locked}
        colorMode={theme}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color={theme === 'dark' ? '#232a37' : '#d7dee7'} />
        <Controls showInteractive={false} className="!rounded-lg !border !border-surface-border !bg-surface-1 [&>button]:!border-surface-border [&>button]:!bg-surface-1 [&>button]:!fill-ink [&>button]:hover:!bg-surface-2" />
      </ReactFlow>
    </div>
  )
}
