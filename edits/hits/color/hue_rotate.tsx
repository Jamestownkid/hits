// HUE ROTATE - cycle through colors
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const HueRotate = ({ speed = 5, children }: { speed?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const hue = frame * speed
  
  return (
    <AbsoluteFill style={{ filter: `hue-rotate(${hue}deg)` }}>
      {children}
    </AbsoluteFill>
  )
}

