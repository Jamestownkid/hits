// KEN BURNS B-ROLL - cinematic pan and zoom
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const KenBurnsBroll = ({ src, direction = 'in' }: { src: string; direction?: string }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  
  const scale = direction === 'in' 
    ? interpolate(frame, [0, durationInFrames], [1, 1.3], { extrapolateRight: 'clamp' })
    : interpolate(frame, [0, durationInFrames], [1.3, 1], { extrapolateRight: 'clamp' })
  
  const x = interpolate(frame, [0, durationInFrames], [0, 50], { extrapolateRight: 'clamp' })
  const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={src} style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        transform: `scale(${scale}) translateX(${x}px)`
      }} />
    </AbsoluteFill>
  )
}

