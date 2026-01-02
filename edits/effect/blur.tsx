// BLUR - gaussian blur effect
// for focus transitions and dreamy looks

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface BlurProps {
  amount?: number
  animateIn?: boolean
  durationInFrames: number
}

export const Blur: React.FC<BlurProps> = ({
  amount = 10,
  animateIn = true,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const blur = animateIn
    ? interpolate(frame, [0, durationInFrames * 0.3, durationInFrames * 0.7, durationInFrames], [0, amount, amount, 0], {
        extrapolateRight: 'clamp'
      })
    : amount

  return (
    <AbsoluteFill
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`
      }}
    />
  )
}

export default Blur

