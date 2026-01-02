// SLOW ZOOM IN - cinematic Ken Burns style
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const ZoomInSlow = ({ target = 1.2, children }: { target?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [1, target], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

