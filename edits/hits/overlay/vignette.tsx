// VIGNETTE - darkened edges
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Vignette = ({ intensity = 0.7 }: { intensity?: number }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 10], [0, intensity], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.9) 100%)',
      opacity,
      pointerEvents: 'none'
    }} />
  )
}

