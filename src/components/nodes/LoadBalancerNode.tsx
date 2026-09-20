import { Handle, Position, type NodeProps } from '@xyflow/react'
import { LoadBalancerIcon } from '../icons'
import type { FlowNode } from '../../store/graphStore'
import { NodeShell } from './NodeShell'

export function LoadBalancerNode({ data, selected }: NodeProps<FlowNode>) {
  return (
    <NodeShell icon={<LoadBalancerIcon className="h-full w-full" />} name={data.name} kindLabel="Load balancer · round robin" selected={selected}>
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-surface-1 !bg-ink-faint" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-surface-1 !bg-accent" />
    </NodeShell>
  )
}
