// ZOOM PULSE - quick zoom in/out for emphasis
// triggers on important words and key moments

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface ZoomPulseProps {
  intensity?: number
  direction?: 'in' | 'out' | 'pulse'
  easing?: 'spring' | 'linear'
  durationInFrames: number
}

export const ZoomPulse: React.FC<ZoomPulseProps> = ({
  intensity = 1.15,
  direction = 'pulse',
  easing = 'spring',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  let scale: number

  if (easing === 'spring') {
    const springVal = spring({
      fps,
      frame,
      config: { damping: 12, stiffness: 100 },
      durationInFrames
    })

    if (direction === 'in') {
      scale = interpolate(springVal, [0, 1], [1, intensity])
    } else if (direction === 'out') {
      scale = interpolate(springVal, [0, 1], [intensity, 1])
    } else {
      // pulse - zoom in then out
      const half = durationInFrames / 2
      if (frame < half) {
        scale = interpolate(frame, [0, half], [1, intensity])
      } else {
        scale = interpolate(frame, [half, durationInFrames], [intensity, 1])
      }
    }
  } else {
    if (direction === 'in') {
      scale = interpolate(frame, [0, durationInFrames], [1, intensity], {
        extrapolateRight: 'clamp'
      })
    } else if (direction === 'out') {
      scale = interpolate(frame, [0, durationInFrames], [intensity, 1], {
        extrapolateRight: 'clamp'
      })
    } else {
      const half = durationInFrames / 2
      if (frame < half) {
        scale = interpolate(frame, [0, half], [1, intensity])
      } else {
        scale = interpolate(frame, [half, durationInFrames], [intensity, 1])
      }
    }
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}
    />
  )
}

export default ZoomPulse

