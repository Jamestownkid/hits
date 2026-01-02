// ZOOM TRANSITION - zoom in/out transition
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ZoomTransition = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 10, 20], [1, 3, 1], { extrapolateRight: 'clamp' })
  const opacity = interpolate(frame, [8, 12], [1, 0], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </AbsoluteFill>
  )
}

