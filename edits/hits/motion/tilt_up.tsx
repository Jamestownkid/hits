// TILT UP - camera tilts upward
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const TiltUp = ({ distance = 80, children }: { distance?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const y = interpolate(frame, [0, durationInFrames], [0, -distance], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px) scale(1.1)` }}>
      {children}
    </AbsoluteFill>
  )
}

