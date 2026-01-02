// SPOTLIGHT - focused spotlight effect
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Spotlight = ({ x = 50, y = 50 }: { x?: number; y?: number }) => {
  const frame = useCurrentFrame()
  const size = interpolate(frame, [0, 20], [0, 30], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at ${x}% ${y}%, transparent ${size}%, rgba(0,0,0,0.9) ${size + 20}%)`,
      pointerEvents: 'none'
    }} />
  )
}

