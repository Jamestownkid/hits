// CORNER TOP LEFT - b-roll in top left corner
import { AbsoluteFill, Img, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const CornerTopLeft = ({ src, size = 300 }: { src: string; size?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 12 } })
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: size,
        height: size,
        transform: `scale(${scale})`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        border: '3px solid #fff'
      }}>
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </AbsoluteFill>
  )
}

