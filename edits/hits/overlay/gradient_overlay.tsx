// GRADIENT OVERLAY - colorful gradient
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const GradientOverlay = () => {
  const frame = useCurrentFrame()
  const hue = frame * 3 % 360
  
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${hue}deg, hsla(${hue}, 80%, 50%, 0.3), transparent)`,
      pointerEvents: 'none'
    }} />
  )
}

