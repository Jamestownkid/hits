// PROGRESS BAR - animated progress indicator
// for showing completion or timeline

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface ProgressBarProps {
  progress?: number
  animate?: boolean
  color?: string
  position?: 'top' | 'bottom'
  durationInFrames: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 100,
  animate = true,
  color = '#22c55e',
  position = 'bottom',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const currentProgress = animate
    ? interpolate(frame, [0, durationInFrames * 0.8], [0, progress], {
        extrapolateRight: 'clamp'
      })
    : progress

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          [position]: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.2)'
        }}
      >
        <div
          style={{
            width: `${currentProgress}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.1s ease'
          }}
        />
      </div>
    </AbsoluteFill>
  )
}

export default ProgressBar

