// TYPEWRITER - text typing effect
// classic hacker/terminal vibes

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface TypewriterProps {
  text: string
  color?: string
  fontSize?: number
  showCursor?: boolean
  speed?: number
  durationInFrames: number
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  color = '#00ff00',
  fontSize = 48,
  showCursor = true,
  speed = 1,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const charsPerFrame = (text.length / durationInFrames) * speed * 2
  const visibleChars = Math.floor(frame * charsPerFrame)
  const displayText = text.slice(0, Math.min(visibleChars, text.length))
  
  // blinking cursor
  const cursorVisible = showCursor && Math.floor(frame / 15) % 2 === 0

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize,
          color,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '20px 40px',
          borderRadius: 8
        }}
      >
        {displayText}
        {cursorVisible && <span style={{ opacity: 0.8 }}>|</span>}
      </div>
    </AbsoluteFill>
  )
}

export default Typewriter

