// WIPE UP - wipe from bottom to top
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const WipeUp = ({ color = '#000' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const { height, durationInFrames } = useVideoConfig()
  const y = interpolate(frame, [0, durationInFrames], [height, -height], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: color, transform: `translateY(${y}px)` }} />
}

