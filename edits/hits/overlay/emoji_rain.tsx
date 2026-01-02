// EMOJI RAIN - falling emojis
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const EmojiRain = ({ emoji = '🔥', count = 20 }: { emoji?: string; count?: number }) => {
  const frame = useCurrentFrame()
  const { height } = useVideoConfig()
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(count)].map((_, i) => {
        const x = (i * 137.5) % 100
        const speed = 5 + (i % 5) * 2
        const y = ((frame * speed + i * 50) % (height + 100)) - 50
        const rotation = frame * (i % 2 === 0 ? 3 : -3)
        
        return (
          <span key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: y,
            fontSize: 30 + (i % 3) * 10,
            transform: `rotate(${rotation}deg)`
          }}>{emoji}</span>
        )
      })}
    </AbsoluteFill>
  )
}

