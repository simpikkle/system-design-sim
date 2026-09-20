import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ServerIcon } from '../icons'
import { useSimStore } from '../../store/simStore'
import type { FlowNode } from '../../store/graphStore'
import { NodeShell } from './NodeShell'
import { UtilizationBar } from '../UtilizationBar'
import { HANDLE_CLASS } from '../handleStyle'

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
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      {stat && <UtilizationBar utilization={stat.utilization} status={stat.status} latencyMs={stat.latencyMs} />}
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}
