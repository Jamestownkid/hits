// TEXT SLIDE IN - slides in from side
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const TextSlideIn = ({ text = 'BREAKING', from = 'left' }: { text?: string; from?: string }) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()
  const progress = spring({ frame, fps, from: 0, to: 1 })
  const x = from === 'left' ? (1 - progress) * -width : (1 - progress) * width
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 80,
        fontWeight: 800,
        color: '#ff0',
        transform: `translateX(${x}px)`,
        textShadow: '3px 3px 0 #000'
      }}>{text}</span>
    </AbsoluteFill>
  )
}

