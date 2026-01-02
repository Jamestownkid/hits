// SPIN - rotation effect
// good for transitions and dramatic moments

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface SpinProps {
  direction?: 'clockwise' | 'counterclockwise'
  rotations?: number
  withZoom?: boolean
  durationInFrames: number
}

export const Spin: React.FC<SpinProps> = ({
  direction = 'clockwise',
  rotations = 1,
  withZoom = true,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const springVal = spring({
    fps,
    frame,
    config: { damping: 15, stiffness: 80 },
    durationInFrames
  })
  
  const rotation = interpolate(
    springVal,
    [0, 1],
    [0, 360 * rotations * (direction === 'counterclockwise' ? -1 : 1)]
  )
  
  const scale = withZoom
    ? interpolate(springVal, [0, 0.5, 1], [1, 1.3, 1])
    : 1

  return (
    <AbsoluteFill
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center center'
      }}
    />
  )
}

export default Spin

