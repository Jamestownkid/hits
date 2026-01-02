// WIPE - directional wipe transition
// slides in from a direction

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface WipeProps {
  direction?: 'left' | 'right' | 'up' | 'down'
  color?: string
  durationInFrames: number
}

export const Wipe: React.FC<WipeProps> = ({
  direction = 'left',
  color = '#000000',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const progress = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 100, 200],
    { extrapolateRight: 'clamp' }
  )

  let clipPath = ''
  switch (direction) {
    case 'left':
      clipPath = `inset(0 ${Math.max(0, 100 - progress)}% 0 ${Math.max(0, progress - 100)}%)`
      break
    case 'right':
      clipPath = `inset(0 ${Math.max(0, progress - 100)}% 0 ${Math.max(0, 100 - progress)}%)`
      break
    case 'up':
      clipPath = `inset(${Math.max(0, progress - 100)}% 0 ${Math.max(0, 100 - progress)}% 0)`
      break
    case 'down':
      clipPath = `inset(${Math.max(0, 100 - progress)}% 0 ${Math.max(0, progress - 100)}% 0)`
      break
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        clipPath
      }}
    />
  )
}

export default Wipe

