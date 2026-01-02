// SHAKE - camera shake effect for impact
// good for dramatic moments and explosions

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion'

interface ShakeProps {
  intensity?: number
  frequency?: number
  decay?: boolean
  durationInFrames: number
}

export const Shake: React.FC<ShakeProps> = ({
  intensity = 10,
  frequency = 2,
  decay = true,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  // decay the shake over time if enabled
  const decayFactor = decay 
    ? interpolate(frame, [0, durationInFrames], [1, 0], { extrapolateRight: 'clamp' })
    : 1
  
  // generate random shake values based on frame
  const seed = frame * frequency
  const x = (random(seed) - 0.5) * intensity * 2 * decayFactor
  const y = (random(seed + 100) - 0.5) * intensity * 2 * decayFactor
  const rotation = (random(seed + 200) - 0.5) * (intensity / 5) * decayFactor

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      }}
    />
  )
}

export default Shake

