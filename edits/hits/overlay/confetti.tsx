// CONFETTI - celebration confetti
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const Confetti = ({ count = 100 }: { count?: number }) => {
  const frame = useCurrentFrame()
  const { height } = useVideoConfig()
  const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f']
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(count)].map((_, i) => {
        const x = (i * 137.5) % 100
        const speed = 3 + (i % 5) * 2
        const y = ((frame * speed + i * 20) % (height + 50)) - 25
        const rotation = frame * (i % 2 === 0 ? 5 : -5)
        const color = colors[i % colors.length]
        
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: y,
            width: 10,
            height: 10,
            backgroundColor: color,
            transform: `rotate(${rotation}deg)`,
            borderRadius: i % 2 === 0 ? '50%' : 0
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

