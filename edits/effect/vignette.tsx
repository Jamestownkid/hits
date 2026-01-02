// VIGNETTE - darkened edges for cinematic look
// focuses attention on the center

import React from 'react'
import { AbsoluteFill } from 'remotion'

interface VignetteProps {
  intensity?: number
  size?: number
  durationInFrames: number
}

export const Vignette: React.FC<VignetteProps> = ({
  intensity = 0.6,
  size = 50,
  durationInFrames
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, transparent ${size}%, rgba(0,0,0,${intensity}) 100%)`
      }}
    />
  )
}

export default Vignette

