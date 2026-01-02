// COUNTER - animated number counter
// for stats, money, scores

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface CounterProps {
  from?: number
  to: number
  prefix?: string
  suffix?: string
  color?: string
  fontSize?: number
  durationInFrames: number
}

export const Counter: React.FC<CounterProps> = ({
  from = 0,
  to,
  prefix = '',
  suffix = '',
  color = '#ffffff',
  fontSize = 96,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const current = Math.round(
    interpolate(frame, [0, durationInFrames * 0.8], [from, to], {
      extrapolateRight: 'clamp'
    })
  )
  
  // format with commas
  const formatted = current.toLocaleString()

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          fontSize,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          color,
          textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
        }}
      >
        {prefix}{formatted}{suffix}
      </div>
    </AbsoluteFill>
  )
}

export default Counter

