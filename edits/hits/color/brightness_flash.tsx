// BRIGHTNESS FLASH - quick brightness flash
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const BrightnessFlash = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const brightness = interpolate(frame, [0, 3, 10], [1, 2, 1], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `brightness(${brightness})` }}>
      {children}
    </AbsoluteFill>
  )
}

