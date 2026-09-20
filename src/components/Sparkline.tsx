interface SparklineProps {
  values: number[]
  color: string
  width?: number
  height?: number
}

export function Sparkline({ values, color, width = 88, height = 28 }: SparklineProps) {
  if (values.length < 2) return <svg width={width} height={height} aria-hidden />
  const max = Math.max(...values, 0.001)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / range) * height

      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} role="img" aria-label="trend">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </svg>
  )
}
