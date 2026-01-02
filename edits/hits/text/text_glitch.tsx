// TEXT GLITCH - glitchy text effect
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const TextGlitch = ({ text = 'ERROR' }: { text?: string }) => {
  const frame = useCurrentFrame()
  const glitchOffset = frame % 4 === 0 ? Math.random() * 10 - 5 : 0
  const colorShift = frame % 3 === 0
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 100,
        fontWeight: 900,
        color: colorShift ? '#f00' : '#fff',
        transform: `translateX(${glitchOffset}px)`,
        textShadow: colorShift ? '5px 0 #0ff, -5px 0 #f0f' : 'none',
        fontFamily: 'Impact'
      }}>{text}</span>
    </AbsoluteFill>
  )
}

