// HIGHLIGHT - text with marker highlight animation
// like someone drawing with a highlighter

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface HighlightProps {
  text: string
  highlightColor?: string
  textColor?: string
  fontSize?: number
  durationInFrames: number
}

export const Highlight: React.FC<HighlightProps> = ({
  text,
  highlightColor = '#fef08a',
  textColor = '#000000',
  fontSize = 64,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const progress = interpolate(frame, [0, durationInFrames * 0.5], [0, 100], {
    extrapolateRight: 'clamp'
  })
  
  const textOpacity = spring({
    fps,
    frame: frame - 5,
    config: { damping: 12 },
    durationInFrames: 15
  })

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', padding: '10px 20px' }}>
        {/* highlight background */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '10%',
            height: '80%',
            width: `${progress}%`,
            backgroundColor: highlightColor,
            transform: 'skewX(-5deg)',
            zIndex: 0
          }}
        />
        {/* text */}
        <div
          style={{
            position: 'relative',
            fontSize,
            fontWeight: 'bold',
            color: textColor,
            opacity: textOpacity,
            zIndex: 1
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  )
}

export default Highlight

