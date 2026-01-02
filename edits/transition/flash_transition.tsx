// FLASH TRANSITION - white flash between scenes
// classic transition for scene changes

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface FlashTransitionProps {
  color?: string
  intensity?: number
  durationInFrames: number
}

export const FlashTransition: React.FC<FlashTransitionProps> = ({
  color = '#ffffff',
  intensity = 1,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  // flash in then out
  const opacity = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, intensity, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity
      }}
    />
  )
}

export default FlashTransition

