// ZOOM PUNCH - MrBeast style hard zoom
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

export const ZoomPunch = ({ intensity = 1.4, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const scale = spring({ frame, fps, from: 1, to: intensity, durationInFrames: 6 })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

