// JITTER - nervous jittery motion
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Jitter = ({ intensity = 2, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const x = (Math.random() - 0.5) * intensity * (frame % 2)
  const y = (Math.random() - 0.5) * intensity * ((frame + 1) % 2)
  
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </AbsoluteFill>
  )
}

