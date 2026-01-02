// SWING - pendulum swing motion
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Swing = ({ amount = 5, children }: { amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const rotation = Math.sin(frame * 0.15) * amount
  
  return (
    <AbsoluteFill style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'top center' }}>
      {children}
    </AbsoluteFill>
  )
}

