// COLOR OVERLAY - tinted overlay
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ColorOverlay = ({ color = 'rgba(255,0,0,0.3)' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 5, 20, 25], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: color, opacity, pointerEvents: 'none' }} />
}

