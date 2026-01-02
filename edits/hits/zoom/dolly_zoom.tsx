// DOLLY ZOOM - Hitchcock vertigo effect
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const DollyZoom = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.5], { extrapolateRight: 'clamp' })
  const perspective = interpolate(frame, [0, durationInFrames], [1000, 600], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ 
      transform: `scale(${scale}) perspective(${perspective}px)`, 
      transformOrigin: 'center' 
    }}>
      {children}
    </AbsoluteFill>
  )
}

