// SPIN TRANSITION - spinning transition
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const SpinTransition = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const rotation = interpolate(frame, [0, 15], [0, 360], { extrapolateRight: 'clamp' })
  const scale = interpolate(frame, [0, 7, 15], [1, 0, 1], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  )
}

