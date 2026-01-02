// SATURATE BOOST - increase saturation
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const SaturateBoost = ({ amount = 1.5, children }: { amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const saturation = interpolate(frame, [0, 10], [1, amount], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `saturate(${saturation})` }}>
      {children}
    </AbsoluteFill>
  )
}

