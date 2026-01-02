// LIKE BUTTON - animated like CTA
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const LikeButton = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 8 } })
  const bounce = frame % 30 < 15 ? spring({ frame: frame % 30, fps, from: 1, to: 1.2 }) : 1
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 60, pointerEvents: 'none' }}>
      <div style={{
        transform: `scale(${scale * bounce})`,
        fontSize: 80
      }}>👍</div>
    </AbsoluteFill>
  )
}

