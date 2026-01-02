// TEXT REVEAL - animated text that pops in with style
// use for highlighting keywords and important phrases

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface TextRevealProps {
  text: string
  style?: 'scale' | 'slide' | 'fade' | 'typewriter'
  color?: string
  fontSize?: number
  position?: 'center' | 'bottom' | 'top'
  durationInFrames: number
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  style = 'scale',
  color = '#ffffff',
  fontSize = 72,
  position = 'center',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    center: { justifyContent: 'center', alignItems: 'center' },
    bottom: { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '10%' },
    top: { justifyContent: 'flex-start', alignItems: 'center', paddingTop: '10%' },
  }

  // animation based on style
  let textStyle: React.CSSProperties = {}

  switch (style) {
    case 'scale': {
      const scaleSpring = spring({
        fps,
        frame,
        config: { damping: 10, stiffness: 100 },
        durationInFrames: Math.min(durationInFrames, 20)
      })
      textStyle = {
        transform: `scale(${scaleSpring})`,
        opacity: scaleSpring
      }
      break
    }
    case 'slide': {
      const slideProgress = spring({
        fps,
        frame,
        config: { damping: 15, stiffness: 80 },
        durationInFrames: Math.min(durationInFrames, 25)
      })
      textStyle = {
        transform: `translateY(${interpolate(slideProgress, [0, 1], [50, 0])}px)`,
        opacity: slideProgress
      }
      break
    }
    case 'fade': {
      const fadeProgress = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
      textStyle = { opacity: fadeProgress }
      break
    }
    case 'typewriter': {
      const charsToShow = Math.floor(interpolate(frame, [0, durationInFrames * 0.7], [0, text.length], { extrapolateRight: 'clamp' }))
      return (
        <AbsoluteFill style={{ display: 'flex', ...positionStyles[position] }}>
          <div
            style={{
              color,
              fontSize,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            {text.slice(0, charsToShow)}
            <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
          </div>
        </AbsoluteFill>
      )
    }
  }

  return (
    <AbsoluteFill style={{ display: 'flex', ...positionStyles[position] }}>
      <div
        style={{
          color,
          fontSize,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
          ...textStyle
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  )
}

export default TextReveal

