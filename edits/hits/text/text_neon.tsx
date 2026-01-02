// TEXT NEON - neon glow text
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const TextNeon = ({ text = 'NEON', color = '#0ff' }: { text?: string; color?: string }) => {
  const frame = useCurrentFrame()
  const glow = interpolate(Math.sin(frame * 0.2), [-1, 1], [10, 30])
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
      <span style={{
        fontSize: 120,
        fontWeight: 700,
        color,
        textShadow: `0 0 ${glow}px ${color}, 0 0 ${glow * 2}px ${color}`,
        fontFamily: 'Arial Black'
      }}>{text}</span>
    </AbsoluteFill>
  )
}

