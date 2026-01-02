// FLASH WHITE - quick white flash transition
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const FlashWhite = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 3, 8], [0, 1, 0], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: '#fff', opacity }} />
}

