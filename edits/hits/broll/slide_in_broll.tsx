// SLIDE IN B-ROLL - slides in from side
import { AbsoluteFill, Img, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const SlideInBroll = ({ src, from = 'right' }: { src: string; from?: string }) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()
  const progress = spring({ frame, fps, from: 0, to: 1, config: { damping: 15 } })
  const x = from === 'right' ? (1 - progress) * width : (progress - 1) * width
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: '10%',
        right: from === 'right' ? 20 : 'auto',
        left: from === 'left' ? 20 : 'auto',
        width: 350,
        height: 200,
        transform: `translateX(${x}px)`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </AbsoluteFill>
  )
}

