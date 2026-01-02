// SPIN FAST - fast spin
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const SpinFast = ({ speed = 10, children }: { speed?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const rotation = frame * speed
  
  return (
    <AbsoluteFill style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

