import { Handle, Position, type NodeProps } from '@xyflow/react'
import { LoadBalancerIcon } from '../icons'
import { useSimStore } from '../../store/simStore'
import type { FlowNode } from '../../store/graphStore'
import { NodeShell } from './NodeShell'
import { UtilizationBar } from '../UtilizationBar'
import { HANDLE_CLASS } from '../handleStyle'
import { DEFAULT_LB_STRATEGY, LB_STRATEGY_LABEL } from '../../simulation/specs'

export function LoadBalancerNode({ id, data, selected }: NodeProps<FlowNode>) {
  const strategy = data.strategy ?? DEFAULT_LB_STRATEGY
  const stat = useSimStore((s) => s.displayed?.nodeStats[id])
  const showLoad = strategy === 'least-connections'

  return (
    <NodeShell
      icon={<LoadBalancerIcon className="h-full w-full" />}
      name={data.name}
      kindLabel={`Load balancer · ${LB_STRATEGY_LABEL[strategy].toLowerCase()}`}
      selected={selected}
      status={showLoad ? stat?.status : undefined}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      {showLoad && stat && <UtilizationBar utilization={stat.utilization} status={stat.status} latencyMs={stat.latencyMs} />}
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}
