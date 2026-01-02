// FULLSCREEN B-ROLL - full screen image overlay
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion'

export const FullscreenBroll = ({ src }: { src: string }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 10, 50, 60], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
  )
}

