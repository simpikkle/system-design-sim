import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { useSimStore } from '../../store/simStore'
import { STATUS_COLOR } from '../statusColors'
import type { FlowEdge } from '../../store/graphStore'

const IDLE_COLOR = 'var(--color-ink-faint)'
const DOT_COUNT = 3

export function TrafficEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps<FlowEdge>) {
  const stat = useSimStore((s) => s.displayed?.edgeStats[id])
  const status = useSimStore((s) => s.status)
  const hasData = status !== 'idle'
  const animating = status === 'running'
  const [path] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 0 })

  const rps = stat?.rps ?? 0
  const color = hasData && stat ? STATUS_COLOR[stat.status] : IDLE_COLOR
  const active = animating && rps > 0.5
  const duration = active ? Math.max(0.5, 2.4 - Math.min(rps, 800) / 500) : 0

  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: color, strokeWidth: active ? 2.5 : 2, opacity: active ? 0.9 : 0.85 }} />
      {active && (
        <>
          <path id={`${id}-guide`} d={path} fill="none" stroke="none" />
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <circle key={i} r={active ? 3 : 0} fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
              <animateMotion dur={`${duration}s`} begin={`${(i * duration) / DOT_COUNT}s`} repeatCount="indefinite">
                <mpath href={`#${id}-guide`} />
              </animateMotion>
            </circle>
          ))}
        </>
      )}
    </>
  )
}
