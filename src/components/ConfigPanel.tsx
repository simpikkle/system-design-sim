import { useGraphStore } from '../store/graphStore'
import { useSimStore } from '../store/simStore'
import { SIZE_SPECS } from '../simulation/specs'
import type { Size } from '../simulation/types'
import { ClientIcon, DbIcon, LoadBalancerIcon, ServerIcon } from './icons'

const SIZES: Size[] = ['small', 'medium', 'large']

const SIZE_LABEL: Record<Size, string> = { small: 'S', medium: 'M', large: 'L' }

const ICONS = { client: ClientIcon, loadBalancer: LoadBalancerIcon, server: ServerIcon, db: DbIcon }

export function ConfigPanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode, locked } = useGraphStore()
  const scenario = useSimStore((s) => s.scenario)
  const traffic = useSimStore((s) => s.traffic)
  const setTraffic = useSimStore((s) => s.setTraffic)
  const status = useSimStore((s) => s.status)
  const node = nodes.find((n) => n.id === selectedNodeId)
  const trafficLocked = status !== 'idle'

  if (!node) {
    return (
      <aside className="flex w-72 shrink-0 flex-col gap-6 border-l border-surface-border bg-surface-1/60 p-6">
        <div>
          <div className="font-display text-sm font-semibold text-ink">{scenario.name}</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{scenario.description}</p>
        </div>

        <div>
          <span className="mb-1.5 block text-[11px] font-medium text-ink-muted">Traffic</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[10px] text-ink-faint">Base req/s</span>
              <input
                type="number"
                min={1}
                max={traffic.peakRps - 1}
                step={10}
                value={traffic.baseRps}
                disabled={trafficLocked}
                onChange={(e) => setTraffic({ baseRps: Number(e.target.value) })}
                className="w-full rounded-md border border-surface-border bg-surface-2 px-2.5 py-1.5 font-mono text-[13px] text-ink outline-none focus:border-accent disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] text-ink-faint">Peak req/s</span>
              <input
                type="number"
                min={traffic.baseRps + 1}
                max={20000}
                step={100}
                value={traffic.peakRps}
                disabled={trafficLocked}
                onChange={(e) => setTraffic({ peakRps: Number(e.target.value) })}
                className="w-full rounded-md border border-surface-border bg-surface-2 px-2.5 py-1.5 font-mono text-[13px] text-ink outline-none focus:border-accent disabled:opacity-50"
              />
            </label>
          </div>
          <label className="mt-2 block">
            <span className="mb-1 block text-[10px] text-ink-faint">Ramp duration (s)</span>
            <input
              type="number"
              min={5}
              max={120}
              step={5}
              value={traffic.durationSec}
              disabled={trafficLocked}
              onChange={(e) => setTraffic({ durationSec: Number(e.target.value) })}
              className="w-full rounded-md border border-surface-border bg-surface-2 px-2.5 py-1.5 font-mono text-[13px] text-ink outline-none focus:border-accent disabled:opacity-50"
            />
          </label>
          <p className="mt-2 text-[11px] leading-snug text-ink-faint">
            Traffic eases from base to peak over the ramp duration. Locked once a run starts.
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-[13px] text-ink-faint">Select a component to configure it.</p>
          <p className="text-[11px] text-ink-faint">Every number a component uses is shown here — nothing is hidden.</p>
        </div>
      </aside>
    )
  }

  const Icon = ICONS[node.data.kind]
  const sizeSpecs = node.data.kind === 'server' || node.data.kind === 'db' ? SIZE_SPECS[node.data.kind] : null

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-surface-border bg-surface-1/60 p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-semibold text-ink">{node.data.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-faint">{node.data.kind}</div>
        </div>
      </div>

      {node.data.kind !== 'client' && (
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink-muted">Name</span>
          <input
            value={node.data.name}
            disabled={locked}
            onChange={(e) => updateNodeData(node.id, { name: e.target.value })}
            className="w-full rounded-md border border-surface-border bg-surface-2 px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-accent disabled:opacity-50"
          />
        </label>
      )}

      {node.data.kind === 'loadBalancer' && (
        <div>
          <span className="mb-1 block text-[11px] font-medium text-ink-muted">Strategy</span>
          <div className="rounded-md border border-accent-dim bg-accent-dim/40 px-2.5 py-1.5 text-[13px] text-ink">Round robin</div>
          <p className="mt-1 text-[11px] text-ink-faint">Splits incoming traffic evenly across every connected server. More strategies land later.</p>
        </div>
      )}

      {sizeSpecs && (
        <div>
          <span className="mb-1 block text-[11px] font-medium text-ink-muted">Size</span>
          <div className="grid grid-cols-3 gap-1.5">
            {SIZES.map((size) => (
              <button
                key={size}
                disabled={locked}
                onClick={() => updateNodeData(node.id, { size })}
                className={`rounded-md border px-2 py-1.5 font-display text-[12px] font-medium transition-colors disabled:opacity-50 ${
                  node.data.size === size
                    ? 'border-accent bg-accent-dim text-ink'
                    : 'border-surface-border bg-surface-2 text-ink-muted hover:border-ink-faint'
                }`}
              >
                {SIZE_LABEL[size]}
              </button>
            ))}
          </div>
          <dl className="mt-3 space-y-1.5 rounded-md border border-surface-border bg-surface-2/60 p-2.5 font-mono text-[11px] text-ink-muted">
            <Row label="capacity" value={`${sizeSpecs[node.data.size ?? 'small'].capacity} req/s`} />
            <Row label="latency" value={`${sizeSpecs[node.data.size ?? 'small'].latencyMs}ms base`} />
            <Row label="cost" value={`$${sizeSpecs[node.data.size ?? 'small'].costPerHour.toFixed(2)}/hr`} />
          </dl>
        </div>
      )}

      {node.data.kind !== 'client' && (
        <button
          disabled={locked}
          onClick={() => removeNode(node.id)}
          className="mt-auto rounded-md border border-critical/30 bg-critical-dim/40 px-3 py-1.5 text-[12px] font-medium text-critical transition-colors hover:bg-critical-dim disabled:opacity-40"
        >
          Remove component
        </button>
      )}
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}
