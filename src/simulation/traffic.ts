/** Eased ramp from baseRps to peakRps over durationSec — shared by presets and the live traffic controls. */
export function trafficRamp(tSec: number, durationSec: number, baseRps: number, peakRps: number): number {
  const eased = 1 - Math.cos((Math.min(tSec, durationSec) / durationSec) * (Math.PI / 2))
  return baseRps + eased * (peakRps - baseRps)
}
