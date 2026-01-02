// GLITCH - digital glitch effect
// that vhs distortion look everyone loves

import React from 'react'
import { AbsoluteFill, useCurrentFrame, random } from 'remotion'

interface GlitchProps {
  intensity?: number
  slices?: number
  durationInFrames: number
}

export const Glitch: React.FC<GlitchProps> = ({
  intensity = 20,
  slices = 5,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const glitchSlices = Array.from({ length: slices }, (_, i) => {
    const yOffset = (random(frame + i) - 0.5) * intensity
    const xOffset = (random(frame + i + 100) - 0.5) * intensity * 2
    const height = 100 / slices
    const top = i * height
    
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: `${top}%`,
          left: 0,
          right: 0,
          height: `${height}%`,
          transform: `translate(${xOffset}px, ${yOffset}px)`,
          overflow: 'hidden'
        }}
      />
    )
  })

  return (
    <AbsoluteFill style={{ mixBlendMode: 'difference' }}>
      {glitchSlices}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `rgba(255,0,0,${random(frame) * 0.1})`,
        mixBlendMode: 'screen'
      }} />
    </AbsoluteFill>
  )
}

export default Glitch

