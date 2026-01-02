// DESATURATE - reduce to grayscale
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Desaturate = ({ amount = 0, children }: { amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const saturation = interpolate(frame, [0, 15], [1, amount], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `saturate(${saturation})` }}>
      {children}
    </AbsoluteFill>
  )
}

