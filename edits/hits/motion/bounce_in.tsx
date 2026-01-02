// BOUNCE IN - bouncy entrance
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const BounceIn = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 8, stiffness: 200 } })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

