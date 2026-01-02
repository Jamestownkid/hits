// PAN RIGHT - smooth pan to right
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const PanRight = ({ distance = 100, children }: { distance?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const x = interpolate(frame, [0, durationInFrames], [0, distance], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px) scale(1.1)` }}>
      {children}
    </AbsoluteFill>
  )
}

