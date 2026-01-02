// TEXT BOUNCE - bouncy text animation
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const TextBounce = ({ text = 'BOING' }: { text?: string }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const y = spring({ frame, fps, from: -200, to: 0, config: { damping: 8 } })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 100,
        fontWeight: 900,
        color: '#ff6b6b',
        transform: `translateY(${y}px)`,
        textShadow: '4px 4px 0 #000'
      }}>{text}</span>
    </AbsoluteFill>
  )
}

