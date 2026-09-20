import { ReactFlowProvider } from '@xyflow/react'
import { Canvas } from './components/Canvas'
import { Palette } from './components/Palette'
import { ConfigPanel } from './components/ConfigPanel'
import { Toolbar } from './components/Toolbar'
import { TelemetryStrip } from './components/TelemetryStrip'
import { useSimulationClock } from './hooks/useSimulationClock'

function App() {
  useSimulationClock()

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-0 text-ink">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <Palette />
        <main className="min-w-0 flex-1">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </main>
        <ConfigPanel />
      </div>
      <TelemetryStrip />
    </div>
  )
}

export default App
