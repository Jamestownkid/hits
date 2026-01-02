// TUTORIAL HIGHLIGHT - clean highlight box
// for educational content pointing stuff out
// actually useful for tutorials ngl

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface TutorialHighlightProps {
  startFrame?: number
  endFrame?: number
  x?: number
  y?: number
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  label?: string
  pulseEnabled?: boolean
  variant?: 'box' | 'circle' | 'arrow' | 'underline'
}

export const TutorialHighlight: React.FC<TutorialHighlightProps> = ({
  startFrame = 0,
  endFrame = 60,
  x = 0.5,
  y = 0.5,
  width = 0.3,
  height = 0.2,
  color = '#3b82f6',
  strokeWidth = 4,
  label = '',
  pulseEnabled = true,
  variant = 'box',
}) => {
  const frame = useCurrentFrame()
  const { fps, width: vw, height: vh } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  // spring animation for pop-in
  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 150 },
  })

  // pulse effect
  const pulse = pulseEnabled
    ? 1 + Math.sin(localFrame * 0.3) * 0.05
    : 1

  // fade out at end
  const opacity = interpolate(
    localFrame,
    [duration - 15, duration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // calculate actual pixels
  const boxX = (x - width / 2) * vw
  const boxY = (y - height / 2) * vh
  const boxW = width * vw
  const boxH = height * vh

  const renderHighlight = () => {
    switch (variant) {
      case 'circle':
        const radius = Math.min(boxW, boxH) / 2
        return (
          <div
            style={{
              position: 'absolute',
              left: x * vw - radius,
              top: y * vh - radius,
              width: radius * 2,
              height: radius * 2,
              border: `${strokeWidth}px solid ${color}`,
              borderRadius: '50%',
              transform: `scale(${scale * pulse})`,
              transformOrigin: 'center',
              boxShadow: `0 0 20px ${color}50, inset 0 0 20px ${color}20`,
            }}
          />
        )

      case 'underline':
        return (
          <div
            style={{
              position: 'absolute',
              left: boxX,
              top: boxY + boxH,
              width: boxW * scale,
              height: strokeWidth,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}80`,
            }}
          />
        )

      case 'arrow':
        return (
          <div
            style={{
              position: 'absolute',
              left: boxX - 60,
              top: y * vh,
              transform: `translateY(-50%) scale(${scale})`,
              fontSize: 48,
              color: color,
              textShadow: `0 0 10px ${color}80`,
            }}
          >
            →
          </div>
        )

      case 'box':
      default:
        return (
          <div
            style={{
              position: 'absolute',
              left: boxX,
              top: boxY,
              width: boxW,
              height: boxH,
              border: `${strokeWidth}px solid ${color}`,
              borderRadius: 8,
              transform: `scale(${scale * pulse})`,
              transformOrigin: 'center',
              boxShadow: `0 0 20px ${color}50`,
            }}
          />
        )
    }
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      {renderHighlight()}

      {/* label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            left: x * vw,
            top: boxY - 50,
            transform: `translateX(-50%) scale(${scale})`,
            backgroundColor: color,
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 6,
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter, sans-serif',
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  )
}
