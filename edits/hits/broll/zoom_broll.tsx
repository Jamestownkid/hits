// ZOOM B-ROLL - zooming b-roll overlay
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const ZoomBroll = ({ src }: { src: string }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.2], { extrapolateRight: 'clamp' })
  const opacity = interpolate(frame, [0, 10, durationInFrames - 10, durationInFrames], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={src} style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        transform: `scale(${scale})`
      }} />
    </AbsoluteFill>
  )
}

