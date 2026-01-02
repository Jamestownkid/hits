// FLASH COLOR - colored flash
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const FlashColor = ({ color = '#f00' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 2, 5], [0, 0.8, 0], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />
}

