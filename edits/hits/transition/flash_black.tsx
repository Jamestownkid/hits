// FLASH BLACK - quick black flash
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const FlashBlack = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 2, 6], [0, 1, 0], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: '#000', opacity }} />
}

