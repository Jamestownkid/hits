// SEPIA - vintage sepia tone
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Sepia = ({ amount = 0.8, children }: { amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const sepia = interpolate(frame, [0, 15], [0, amount], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `sepia(${sepia})` }}>
      {children}
    </AbsoluteFill>
  )
}

