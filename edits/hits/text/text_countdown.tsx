// TEXT COUNTDOWN - 3, 2, 1 countdown
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion'

export const TextCountdown = ({ start = 3 }: { start?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const num = Math.max(0, start - Math.floor(frame / fps))
  const scale = spring({ frame: frame % fps, fps, from: 2, to: 1 })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <span style={{
        fontSize: 200,
        fontWeight: 900,
        color: num === 0 ? '#0f0' : '#fff',
        transform: `scale(${scale})`
      }}>{num === 0 ? 'GO!' : num}</span>
    </AbsoluteFill>
  )
}

