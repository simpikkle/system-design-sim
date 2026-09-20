import { Handle, Position, type NodeProps } from '@xyflow/react'
import { LoadBalancerIcon } from '../icons'
import type { FlowNode } from '../../store/graphStore'
import { NodeShell } from './NodeShell'
import { HANDLE_CLASS } from '../handleStyle'

export function LoadBalancerNode({ data, selected }: NodeProps<FlowNode>) {
  return (
    <NodeShell icon={<LoadBalancerIcon className="h-full w-full" />} name={data.name} kindLabel="Load balancer · round robin" selected={selected}>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}
