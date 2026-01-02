// GLITCH TRANSITION - glitchy screen tear
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const GlitchTransition = () => {
  const frame = useCurrentFrame()
  
  return (
    <AbsoluteFill>
      {[...Array(10)].map((_, i) => {
        const offset = (frame + i * 17) % 7 === 0 ? Math.random() * 50 : 0
        return (
          <div key={i} style={{
            position: 'absolute',
            top: `${i * 10}%`,
            left: offset,
            right: -offset,
            height: '10%',
            backgroundColor: frame % 3 === i % 3 ? `rgba(${Math.random()*255},0,${Math.random()*255},0.5)` : 'transparent'
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

