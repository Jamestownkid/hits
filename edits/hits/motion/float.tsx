// FLOAT - gentle floating motion
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Float = ({ amount = 10, children }: { amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const y = Math.sin(frame * 0.1) * amount
  const x = Math.cos(frame * 0.08) * amount * 0.5
  
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </AbsoluteFill>
  )
}

