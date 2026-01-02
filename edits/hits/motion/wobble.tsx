// WOBBLE - wobbly motion
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Wobble = ({ intensity = 5, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const rotation = Math.sin(frame * 0.3) * intensity
  const scale = 1 + Math.sin(frame * 0.5) * 0.05
  
  return (
    <AbsoluteFill style={{ transform: `rotate(${rotation}deg) scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

