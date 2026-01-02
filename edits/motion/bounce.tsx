// BOUNCE - bouncy scale effect
// that satisfying pop animation

import React from 'react'
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

interface BounceProps {
  intensity?: number
  bounces?: number
  durationInFrames: number
}

export const Bounce: React.FC<BounceProps> = ({
  intensity = 1.3,
  bounces = 2,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const bounce = spring({
    fps,
    frame,
    config: { 
      damping: 8,
      stiffness: 150,
      mass: 0.5
    },
    durationInFrames
  })
  
  // create bounce effect
  const scale = 1 + (intensity - 1) * Math.abs(Math.sin(bounce * Math.PI * bounces))

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}
    />
  )
}

export default Bounce

