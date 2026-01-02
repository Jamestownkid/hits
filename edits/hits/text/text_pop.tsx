// TEXT POP - text that pops in with scale
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const TextPop = ({ text = 'WOW', color = '#fff', size = 120 }: { text?: string; color?: string; size?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10 } })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: size,
        fontWeight: 900,
        color,
        textShadow: '4px 4px 0 #000, -2px -2px 0 #000',
        transform: `scale(${scale})`,
        fontFamily: 'Impact, sans-serif'
      }}>{text}</span>
    </AbsoluteFill>
  )
}

