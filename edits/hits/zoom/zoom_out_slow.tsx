// SLOW ZOOM OUT - revealing shot
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const ZoomOutSlow = ({ start = 1.3, children }: { start?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [start, 1], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

