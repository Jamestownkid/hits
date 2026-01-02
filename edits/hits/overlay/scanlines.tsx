// SCANLINES - retro CRT effect
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Scanlines = ({ spacing = 4, opacity = 0.3 }: { spacing?: number; opacity?: number }) => {
  const frame = useCurrentFrame()
  const offset = frame % spacing
  
  return (
    <AbsoluteFill style={{
      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${spacing-1}px, rgba(0,0,0,${opacity}) ${spacing-1}px, rgba(0,0,0,${opacity}) ${spacing}px)`,
      backgroundPosition: `0 ${offset}px`,
      pointerEvents: 'none'
    }} />
  )
}

