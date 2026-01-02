// LETTERBOX - cinematic black bars
// that movie theater feel

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface LetterboxProps {
  amount?: number
  animate?: boolean
  durationInFrames: number
}

export const Letterbox: React.FC<LetterboxProps> = ({
  amount = 12,
  animate = true,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const barHeight = animate
    ? interpolate(
        spring({ fps, frame, config: { damping: 15 }, durationInFrames: 20 }),
        [0, 1],
        [0, amount]
      )
    : amount

  return (
    <AbsoluteFill>
      {/* top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${barHeight}%`,
          backgroundColor: '#000000'
        }}
      />
      {/* bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${barHeight}%`,
          backgroundColor: '#000000'
        }}
      />
    </AbsoluteFill>
  )
}

export default Letterbox

