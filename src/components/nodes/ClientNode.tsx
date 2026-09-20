import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useSimStore } from '../../store/simStore'
import type { FlowNode } from '../../store/graphStore'
import { HANDLE_CLASS } from '../handleStyle'

export function ClientNode({ id }: NodeProps<FlowNode>) {
  const status = useSimStore((s) => s.status)
  const offeredRps = useSimStore((s) => s.displayed?.nodeStats[id]?.incomingRps)
  const running = status !== 'idle'

  return (
    <div className="relative flex h-[72px] w-[72px] items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-[72px] w-[72px] text-accent" fill="currentColor">
        <path d="M5 3.5v17L20 12z" />
      </svg>
      {running && (
        <span className="absolute bottom-full mb-1 whitespace-nowrap font-mono text-sm text-accent">
          {Math.round(offeredRps ?? 0).toLocaleString()} req/s
        </span>
      )}
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </div>
  )
}
