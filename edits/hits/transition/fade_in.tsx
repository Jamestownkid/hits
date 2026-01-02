// FADE IN - simple fade from black
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const FadeIn = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = interpolate(frame, [0, durationInFrames], [1, 0], { extrapolateRight: 'clamp' })
  
  return <AbsoluteFill style={{ backgroundColor: '#000', opacity }} />
}

