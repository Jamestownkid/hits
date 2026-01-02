// PARTICLES - floating particles
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const Particles = ({ count = 50, color = '#fff' }: { count?: number; color?: string }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {[...Array(count)].map((_, i) => {
        const seed = i * 12345
        const x = ((seed % width) + frame * ((i % 5) - 2)) % width
        const y = ((seed * 2) % height + frame * -1) % height
        const size = 2 + (i % 4)
        const opacity = 0.3 + (i % 5) * 0.15
        
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x,
            top: y < 0 ? height + y : y,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            opacity
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

