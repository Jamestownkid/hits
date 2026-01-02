// LIGHT LEAK - cinematic light leak
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const LightLeak = ({ position = 'right' }: { position?: string }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.1, 0.5])
  const dir = position === 'left' ? '270deg' : '90deg'
  
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${dir}, rgba(255,200,100,${opacity}), transparent 50%)`,
      pointerEvents: 'none',
      mixBlendMode: 'screen'
    }} />
  )
}

