// TEXT OUTLINE - outlined text
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const TextOutline = ({ text = 'OUTLINE', color = '#0ff' }: { text?: string; color?: string }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 2, to: 1 })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 100,
        fontWeight: 900,
        color: 'transparent',
        WebkitTextStroke: `3px ${color}`,
        transform: `scale(${scale})`
      }}>{text}</span>
    </AbsoluteFill>
  )
}

