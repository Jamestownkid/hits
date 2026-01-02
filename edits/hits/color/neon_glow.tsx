// NEON GLOW - neon glow effect
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const NeonGlow = ({ color = '#f0f', children }: { color?: string; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const intensity = interpolate(Math.sin(frame * 0.2), [-1, 1], [5, 20])
  
  return (
    <AbsoluteFill style={{ filter: `contrast(1.1) saturate(1.2)` }}>
      {children}
      <AbsoluteFill style={{
        boxShadow: `inset 0 0 ${intensity}px ${color}`,
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  )
}

