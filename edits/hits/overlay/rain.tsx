// RAIN - falling rain effect
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const Rain = ({ count = 100 }: { count?: number }) => {
  const frame = useCurrentFrame()
  const { height } = useVideoConfig()
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(count)].map((_, i) => {
        const x = (i * 73.7) % 100
        const speed = 8 + (i % 5) * 3
        const y = ((frame * speed + i * 15) % (height + 40)) - 20
        const length = 15 + (i % 3) * 5
        
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: y,
            width: 2,
            height: length,
            backgroundColor: 'rgba(200,220,255,0.5)',
            transform: 'rotate(10deg)'
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

