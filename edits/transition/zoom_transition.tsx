// ZOOM TRANSITION - zoom in/out transition
// classic scene change effect

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface ZoomTransitionProps {
  direction?: 'in' | 'out'
  color?: string
  durationInFrames: number
}

export const ZoomTransition: React.FC<ZoomTransitionProps> = ({
  direction = 'in',
  color = '#000000',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const half = durationInFrames / 2
  
  let scale: number
  let opacity: number
  
  if (direction === 'in') {
    scale = interpolate(frame, [0, half, durationInFrames], [0, 50, 100])
    opacity = interpolate(frame, [0, half, durationInFrames], [0, 1, 0])
  } else {
    scale = interpolate(frame, [0, half, durationInFrames], [100, 50, 0])
    opacity = interpolate(frame, [0, half, durationInFrames], [0, 1, 0])
  }

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: `${scale}%`,
          height: `${scale}%`,
          backgroundColor: color,
          borderRadius: '50%',
          opacity
        }}
      />
    </AbsoluteFill>
  )
}

export default ZoomTransition

