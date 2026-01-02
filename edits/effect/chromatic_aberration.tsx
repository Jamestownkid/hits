// CHROMATIC ABERRATION - rgb split effect
// that trippy color shift look

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'

interface ChromaticAberrationProps {
  amount?: number
  animate?: boolean
  durationInFrames: number
}

export const ChromaticAberration: React.FC<ChromaticAberrationProps> = ({
  amount = 5,
  animate = true,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const offset = animate
    ? Math.sin(frame * 0.2) * amount
    : amount

  return (
    <AbsoluteFill
      style={{
        filter: `drop-shadow(${offset}px 0 0 rgba(255,0,0,0.5)) 
                 drop-shadow(${-offset}px 0 0 rgba(0,0,255,0.5))`,
        mixBlendMode: 'screen'
      }}
    />
  )
}

export default ChromaticAberration

