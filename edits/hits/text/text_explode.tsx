// TEXT EXPLODE - letters explode outward
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const TextExplode = ({ text = 'BOOM' }: { text?: string }) => {
  const frame = useCurrentFrame()
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {text.split('').map((char, i) => {
        const angle = (i / text.length) * Math.PI * 2
        const distance = interpolate(frame, [0, 20], [0, 200], { extrapolateRight: 'clamp' })
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const opacity = interpolate(frame, [10, 20], [1, 0], { extrapolateRight: 'clamp' })
        
        return (
          <span key={i} style={{
            position: 'absolute',
            fontSize: 100,
            fontWeight: 900,
            color: '#f00',
            transform: `translate(${x}px, ${y}px)`,
            opacity
          }}>{char}</span>
        )
      })}
    </AbsoluteFill>
  )
}

