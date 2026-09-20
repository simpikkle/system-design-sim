import { useGraphStore, toSimGraph } from '../store/graphStore'
import { useSimStore } from '../store/simStore'
import { VerdictBeacon } from './VerdictBeacon'
import { ThemeToggle } from './ThemeToggle'

export function Toolbar() {
  const { nodes, edges, setLocked } = useGraphStore()
  const { scenario, status, start, reset } = useSimStore()

  const handleRun = () => {
    setLocked(true)
    const graph = toSimGraph(nodes, edges)
    start(graph.nodes, graph.edges)
  }
  const handleReset = () => {
    setLocked(false)
    reset()
  }
  const handleEditDesign = () => {
    setLocked(false)
    reset()
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-surface-border bg-surface-1/80 px-5">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-accent" style={{ boxShadow: '0 0 8px var(--color-accent)' }} />
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">Systemic</span>
      </div>

      <div className="h-8 w-px bg-surface-border" />

      <div className="min-w-0">
        <div className="font-display text-[13px] font-medium text-ink">{scenario.name}</div>
        <div className="max-w-md truncate text-[11px] text-ink-faint">{scenario.description}</div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {status === 'idle' && (
          <button
            onClick={handleRun}
            className="rounded-md bg-accent px-4 py-2 font-display text-[13px] font-semibold text-surface-0 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Run Simulation
          </button>
        )}
        {status === 'running' && (
          <button onClick={handleReset} className="rounded-md border border-surface-border px-4 py-2 font-display text-[13px] font-medium text-ink-muted hover:text-ink">
            Abort
          </button>
        )}
        {status === 'done' && (
          <div className="flex gap-2">
            <button onClick={handleEditDesign} className="rounded-md border border-surface-border px-3.5 py-2 font-display text-[13px] font-medium text-ink-muted hover:text-ink">
              Edit design
            </button>
            <button
              onClick={handleRun}
              className="rounded-md bg-accent px-3.5 py-2 font-display text-[13px] font-semibold text-surface-0 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Run again
            </button>
          </div>
        )}

        <div className="h-8 w-px bg-surface-border" />
        <VerdictBeacon />
        <ThemeToggle />
      </div>
    </header>
  )
}
