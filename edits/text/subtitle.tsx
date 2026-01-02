// SUBTITLE - clean subtitle text at bottom
// for transcription display and captions

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface SubtitleProps {
  text: string
  color?: string
  backgroundColor?: string
  fontSize?: number
  durationInFrames: number
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  color = '#ffffff',
  backgroundColor = 'rgba(0,0,0,0.7)',
  fontSize = 36,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  // fade in at start, fade out at end
  const opacity = interpolate(
    frame,
    [0, 5, durationInFrames - 5, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '8%'
      }}
    >
      <div
        style={{
          backgroundColor,
          color,
          fontSize,
          fontFamily: 'sans-serif',
          padding: '12px 24px',
          borderRadius: 8,
          maxWidth: '80%',
          textAlign: 'center',
          opacity
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  )
}

export default Subtitle

