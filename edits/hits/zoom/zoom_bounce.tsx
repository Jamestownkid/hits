// ZOOM BOUNCE - bouncy zoom effect
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const ZoomBounce = ({ intensity = 1.2, children }: { intensity?: number; children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const scale = spring({ 
    frame, fps, 
    from: 1, to: intensity, 
    config: { damping: 8, stiffness: 200 }
  })
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

