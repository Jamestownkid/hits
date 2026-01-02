// SHAKE LIGHT - subtle camera shake
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const ShakeLight = ({ intensity = 3, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const x = Math.sin(frame * 2) * intensity
  const y = Math.cos(frame * 3) * intensity
  
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </AbsoluteFill>
  )
}

