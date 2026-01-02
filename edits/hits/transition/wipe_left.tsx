// WIPE LEFT - wipe transition from right to left
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const WipeLeft = ({ color = '#000' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const { width, durationInFrames } = useVideoConfig()
  const x = interpolate(frame, [0, durationInFrames], [width, -width], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: color, transform: `translateX(${x}px)` }} />
}

