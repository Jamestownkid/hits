// BLUR FOCUS - blur to focus transition
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const BlurFocus = ({ maxBlur = 10, children }: { maxBlur?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const blur = interpolate(frame, [0, 15], [maxBlur, 0], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  )
}

