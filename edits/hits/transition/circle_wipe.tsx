// CIRCLE WIPE - circular iris wipe
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const CircleWipe = ({ color = '#000' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const radius = interpolate(frame, [0, durationInFrames], [0, 150], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ 
      backgroundColor: color,
      clipPath: `circle(${radius}% at 50% 50%)`
    }} />
  )
}

