import { toSimGraph, useGraphStore } from '../store/graphStore'
import { useSimStore } from '../store/simStore'

export function useRunControls() {
  const { nodes, edges, setLocked } = useGraphStore()
  const { status, start, pause, resume, reset } = useSimStore()

  const run = () => {
    setLocked(true)
    const graph = toSimGraph(nodes, edges)
    start(graph.nodes, graph.edges)
  }

  const pauseRun = () => {
    setLocked(false)
    pause()
  }

  const resumeRun = () => {
    setLocked(true)
    const graph = toSimGraph(nodes, edges)
    resume(graph.nodes, graph.edges)
  }

  const editDesign = () => {
    setLocked(false)
    reset()
  }

  return { status, run, pause: pauseRun, resume: resumeRun, editDesign }
}
