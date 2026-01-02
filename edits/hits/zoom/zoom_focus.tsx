// ZOOM FOCUS - zoom to specific point
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ZoomFocus = ({ x = 50, y = 50, children }: { x?: number; y?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 20], [1, 2], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ 
      transform: `scale(${scale})`, 
      transformOrigin: `${x}% ${y}%` 
    }}>
      {children}
    </AbsoluteFill>
  )
}

