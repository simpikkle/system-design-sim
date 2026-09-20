import type { NodeKind, Size, SizeSpec } from './types'

export const LB_LATENCY_MS = 2
export const CLIENT_LATENCY_MS = 0

/** Every number here is the one true source — shown to the user, never hidden. */
export const SIZE_SPECS: Record<'server' | 'db', Record<Size, SizeSpec>> = {
  server: {
    small: { capacity: 120, latencyMs: 18, costPerHour: 0.05 },
    medium: { capacity: 450, latencyMs: 14, costPerHour: 0.2 },
    large: { capacity: 1400, latencyMs: 11, costPerHour: 0.8 },
  },
  db: {
    small: { capacity: 180, latencyMs: 28, costPerHour: 0.15 },
    medium: { capacity: 700, latencyMs: 22, costPerHour: 0.6 },
    large: { capacity: 2200, latencyMs: 16, costPerHour: 2.4 },
  },
}

/** Wiring rules: no hidden behavior — a component only accepts these upstream kinds. */
export const ALLOWED_CONNECTIONS: Record<NodeKind, NodeKind[]> = {
  client: ['loadBalancer', 'server'],
  loadBalancer: ['server'],
  server: ['db'],
  db: [],
}

export function isValidConnection(sourceKind: NodeKind, targetKind: NodeKind): boolean {
  return ALLOWED_CONNECTIONS[sourceKind]?.includes(targetKind) ?? false
}

export function defaultSizeFor(_kind: NodeKind): Size {
  return 'small'
}
