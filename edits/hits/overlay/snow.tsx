// SNOW - falling snow effect
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const Snow = ({ count = 80 }: { count?: number }) => {
  const frame = useCurrentFrame()
  const { height } = useVideoConfig()
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(count)].map((_, i) => {
        const x = (i * 97.3) % 100
        const speed = 1 + (i % 4)
        const y = ((frame * speed + i * 30) % (height + 20)) - 10
        const size = 3 + (i % 4)
        const opacity = 0.5 + (i % 3) * 0.2
        
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: y,
            width: size,
            height: size,
            backgroundColor: '#fff',
            borderRadius: '50%',
            opacity
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

