import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ServerIcon } from '../icons'
import { useSimStore } from '../../store/simStore'
import type { FlowNode } from '../../store/graphStore'
import { NodeShell } from './NodeShell'
import { UtilizationBar } from '../UtilizationBar'

export function ServerNode({ id, data, selected }: NodeProps<FlowNode>) {
  const stat = useSimStore((s) => s.displayed?.nodeStats[id])
  return (
    <NodeShell
      icon={<ServerIcon className="h-full w-full" />}
      name={data.name}
      kindLabel={`Server · ${data.size}`}
      selected={selected}
      status={stat?.status}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-surface-1 !bg-ink-faint" />
      {stat ? <UtilizationBar utilization={stat.utilization} status={stat.status} latencyMs={stat.latencyMs} /> : <IdleHint />}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-surface-1 !bg-accent" />
    </NodeShell>
  )
}

function IdleHint() {
  return <div className="text-[10px] text-ink-faint">not running</div>
}
