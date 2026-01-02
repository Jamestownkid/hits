// CONTRAST BOOST - increase contrast
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ContrastBoost = ({ amount = 1.3, children }: { amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const contrast = interpolate(frame, [0, 10], [1, amount], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `contrast(${contrast})` }}>
      {children}
    </AbsoluteFill>
  )
}

