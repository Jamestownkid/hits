// TEXT GRADIENT - gradient colored text
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const TextGradient = ({ text = 'GRADIENT' }: { text?: string }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1 })
  const hue = frame * 3
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 100,
        fontWeight: 900,
        background: `linear-gradient(${hue}deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        transform: `scale(${scale})`
      }}>{text}</span>
    </AbsoluteFill>
  )
}

