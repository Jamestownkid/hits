// ZOOM SHAKE - zoom with camera shake
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ZoomShake = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 10], [1, 1.2], { extrapolateRight: 'clamp' })
  const shakeX = Math.sin(frame * 2) * 5
  const shakeY = Math.cos(frame * 2.5) * 5
  
  return (
    <AbsoluteFill style={{ 
      transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`, 
      transformOrigin: 'center' 
    }}>
      {children}
    </AbsoluteFill>
  )
}

