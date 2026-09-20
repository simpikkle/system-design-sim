import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ClientIcon } from '../icons'
import { useSimStore } from '../../store/simStore'
import type { FlowNode } from '../../store/graphStore'
import { NodeShell } from './NodeShell'

export function ClientNode({ id, data, selected }: NodeProps<FlowNode>) {
  const offeredRps = useSimStore((s) => s.displayed?.nodeStats[id]?.incomingRps ?? (s.status !== 'idle' ? 0 : null))
  return (
    <NodeShell icon={<ClientIcon className="h-full w-full" />} name={data.name} kindLabel="Client · traffic source" selected={selected}>
      <div className="font-mono text-[11px] text-ink-muted">
        {offeredRps === null ? 'idle' : <span className="text-accent">{Math.round(offeredRps).toLocaleString()} req/s</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-surface-1 !bg-accent" />
    </NodeShell>
  )
}
