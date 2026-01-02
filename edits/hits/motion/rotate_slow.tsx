// ROTATE SLOW - slow rotation
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const RotateSlow = ({ angle = 10, children }: { angle?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const rotation = interpolate(frame, [0, durationInFrames], [0, angle], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `rotate(${rotation}deg) scale(1.1)`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

