// ZOOM GLITCH - glitchy zoom effect
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const ZoomGlitch = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const glitch = frame % 3 === 0 ? 1.1 : frame % 5 === 0 ? 0.95 : 1
  const offsetX = frame % 4 === 0 ? Math.random() * 10 - 5 : 0
  
  return (
    <AbsoluteFill style={{ 
      transform: `scale(${glitch}) translateX(${offsetX}px)`, 
      transformOrigin: 'center' 
    }}>
      {children}
    </AbsoluteFill>
  )
}

