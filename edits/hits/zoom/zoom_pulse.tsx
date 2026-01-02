// ZOOM PULSE - quick zoom in and out for emphasis
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ZoomPulse = ({ intensity = 1.15, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 8, 16], [1, intensity, 1], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

