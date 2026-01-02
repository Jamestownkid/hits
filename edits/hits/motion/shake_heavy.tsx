// SHAKE HEAVY - intense camera shake
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const ShakeHeavy = ({ intensity = 15, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const x = Math.sin(frame * 5) * intensity
  const y = Math.cos(frame * 7) * intensity
  const rotation = Math.sin(frame * 3) * 2
  
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)` }}>
      {children}
    </AbsoluteFill>
  )
}

