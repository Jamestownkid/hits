// INVERT - invert colors
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Invert = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const invert = interpolate(frame, [0, 5, 10], [0, 1, 0], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `invert(${invert})` }}>
      {children}
    </AbsoluteFill>
  )
}

