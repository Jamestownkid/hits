// FIRE OVERLAY - fire effect at bottom
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const FireOverlay = () => {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {[...Array(30)].map((_, i) => {
        const x = (i / 30) * width
        const height = 50 + Math.sin(frame * 0.2 + i) * 30
        const opacity = 0.5 + Math.sin(frame * 0.3 + i * 0.5) * 0.3
        
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: 0,
            left: x,
            width: 40,
            height,
            background: `linear-gradient(to top, #f80, #ff0, transparent)`,
            opacity,
            borderRadius: '50% 50% 0 0',
            filter: 'blur(5px)'
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

