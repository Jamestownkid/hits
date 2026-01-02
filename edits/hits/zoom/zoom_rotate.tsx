// ZOOM ROTATE - zoom with spin
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ZoomRotate = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 15], [1, 1.3], { extrapolateRight: 'clamp' })
  const rotate = interpolate(frame, [0, 15], [0, 5], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ 
      transform: `scale(${scale}) rotate(${rotate}deg)`, 
      transformOrigin: 'center' 
    }}>
      {children}
    </AbsoluteFill>
  )
}

