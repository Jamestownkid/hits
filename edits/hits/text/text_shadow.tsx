// TEXT SHADOW - dramatic shadow text
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const TextShadow = ({ text = 'SHADOW' }: { text?: string }) => {
  const frame = useCurrentFrame()
  const shadowSize = interpolate(frame, [0, 15], [0, 20], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 100,
        fontWeight: 900,
        color: '#fff',
        textShadow: `${shadowSize}px ${shadowSize}px 0 rgba(0,0,0,0.8)`
      }}>{text}</span>
    </AbsoluteFill>
  )
}

