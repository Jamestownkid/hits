// BORDER FRAME - decorative border
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const BorderFrame = ({ color = '#fff', width = 10 }: { color?: string; width?: number }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{
      border: `${width}px solid ${color}`,
      opacity,
      pointerEvents: 'none',
      boxSizing: 'border-box'
    }} />
  )
}

