import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useSimStore, type RunStatus } from '../../store/simStore'
import type { FlowNode } from '../../store/graphStore'
import { HANDLE_CLASS } from '../handleStyle'

function titleFor(status: RunStatus): string | undefined {
  if (status === 'idle') return 'Click to run the simulation'

  if (status === 'running') return 'Click to pause'

  if (status === 'paused') return 'Click to resume'

  return undefined
}

export function ClientNode({ id }: NodeProps<FlowNode>) {
  const status = useSimStore((s) => s.status)
  const offeredRps = useSimStore((s) => s.displayed?.nodeStats[id]?.incomingRps)
  const running = status !== 'idle'
  const clickable = status === 'idle' || status === 'running' || status === 'paused'

  return (
    <div
      className={`relative flex h-[72px] w-[72px] items-center justify-center ${clickable ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
      title={titleFor(status)}
    >
      {status === 'running' ? (
        <svg viewBox="0 0 24 24" className="h-[72px] w-[72px] text-accent" fill="currentColor">
          <rect x="5" y="3.5" width="5" height="17" rx="1" />
          <rect x="14" y="3.5" width="5" height="17" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[72px] w-[72px] text-accent" fill="currentColor">
          <path d="M5 3.5v17L20 12z" />
        </svg>
      )}
      {running && (
        <span className="absolute bottom-full mb-1 whitespace-nowrap font-mono text-sm text-accent">
          {Math.round(offeredRps ?? 0).toLocaleString()} req/s
        </span>
      )}
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </div>
  )
}
