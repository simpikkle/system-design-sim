import type { NodeKind } from '../simulation/types'
import { DbIcon, LoadBalancerIcon, ServerIcon } from './icons'
import { useGraphStore } from '../store/graphStore'

const ITEMS: { kind: NodeKind; label: string; icon: (c: string) => React.ReactNode }[] = [
  { kind: 'loadBalancer', label: 'Load Balancer', icon: (c) => <LoadBalancerIcon className={c} /> },
  { kind: 'server', label: 'Server', icon: (c) => <ServerIcon className={c} /> },
  { kind: 'db', label: 'Database', icon: (c) => <DbIcon className={c} /> },
]

export function Palette() {
  const locked = useGraphStore((s) => s.locked)

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-surface-border bg-surface-1/60 p-3">
      <h2 className="mb-1 px-1 font-display text-xs font-semibold uppercase tracking-wider text-ink-muted">Components</h2>
      {ITEMS.map((item) => (
        <div
          key={item.kind}
          draggable={!locked}
          onDragStart={(e) => e.dataTransfer.setData('application/x-node-kind', item.kind)}
          className={`group flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 transition-colors ${
            locked ? 'cursor-not-allowed opacity-40' : 'cursor-grab hover:border-surface-border hover:bg-surface-2 active:cursor-grabbing'
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent group-hover:bg-surface-1">
            {item.icon('h-4 w-4')}
          </span>
          <div className="min-w-0 text-[13px] font-medium text-ink">{item.label}</div>
        </div>
      ))}
      <p className="mt-auto px-1 pt-4 text-[11px] leading-snug text-ink-faint">
        Drag onto the canvas, then connect handles. Only valid wiring is accepted.
      </p>
    </aside>
  )
}
