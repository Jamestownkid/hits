// PIP CENTER - picture in picture center
import { AbsoluteFill, Img, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const PipCenter = ({ src, size = 400 }: { src: string; size?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10 } })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        width: size,
        height: size * 0.6,
        transform: `scale(${scale})`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        border: '4px solid #fff'
      }}>
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </AbsoluteFill>
  )
}

