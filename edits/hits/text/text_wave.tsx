// TEXT WAVE - wavy text animation
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const TextWave = ({ text = 'WAVY' }: { text?: string }) => {
  const frame = useCurrentFrame()
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {text.split('').map((char, i) => {
        const y = Math.sin((frame + i * 5) * 0.2) * 20
        return (
          <span key={i} style={{
            fontSize: 100,
            fontWeight: 900,
            color: `hsl(${(frame + i * 30) % 360}, 80%, 60%)`,
            transform: `translateY(${y}px)`,
            display: 'inline-block'
          }}>{char}</span>
        )
      })}
    </AbsoluteFill>
  )
}

