import type { Status } from '../simulation/types'

export const STATUS_COLOR: Record<Status, string> = {
  good: 'var(--color-good)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-critical)',
}

export const STATUS_LABEL: Record<Status, string> = {
  good: 'Healthy',
  warning: 'Strained',
  critical: 'Overloaded',
}

/** Text/icon redundancy alongside color — status is never conveyed by hue alone. */
export const STATUS_GLYPH: Record<Status, string> = {
  good: '●',
  warning: '▲',
  critical: '✕',
}
