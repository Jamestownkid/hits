// LOWER THIRD - name/title card at bottom
// for introducing people or topics

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface LowerThirdProps {
  title: string
  subtitle?: string
  accentColor?: string
  durationInFrames: number
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  title,
  subtitle = '',
  accentColor = '#3b82f6',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const slideIn = spring({
    fps,
    frame,
    config: { damping: 12 },
    durationInFrames: 20
  })
  
  const slideOut = spring({
    fps,
    frame: frame - (durationInFrames - 15),
    config: { damping: 15 },
    durationInFrames: 15
  })
  
  const x = frame < durationInFrames - 15
    ? interpolate(slideIn, [0, 1], [-100, 0])
    : interpolate(slideOut, [0, 1], [0, -100])

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '5%' }}>
      <div
        style={{
          transform: `translateX(${x}%)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {/* accent bar */}
        <div style={{ width: 60, height: 4, backgroundColor: accentColor }} />
        {/* title */}
        <div style={{
          fontSize: 36,
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
        }}>
          {title}
        </div>
        {/* subtitle */}
        {subtitle && (
          <div style={{
            fontSize: 20,
            color: '#ffffff',
            opacity: 0.8,
            textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

export default LowerThird

