// PULSE - rhythmic pulsing
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Pulse = ({ speed = 0.2, amount = 0.05, children }: { speed?: number; amount?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const scale = 1 + Math.sin(frame * speed) * amount
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  )
}

