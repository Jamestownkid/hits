// LEMMINO CINEMATIC - smooth slow zoom with letterbox
// that classic documentary feel like lemmino does
// super clean and professional looking ngl

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

interface LemminoCinematicProps {
  startFrame?: number
  endFrame?: number
  zoomTarget?: number
  zoomDirection?: 'in' | 'out'
  letterboxSize?: number
  fadeFrames?: number
  vignette?: boolean
  vignetteOpacity?: number
  variant?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right'
}

export const LemminoCinematic: React.FC<LemminoCinematicProps> = ({
  startFrame = 0,
  endFrame = 150,
  zoomTarget = 1.15,
  zoomDirection = 'in',
  letterboxSize = 80,
  fadeFrames = 30,
  vignette = true,
  vignetteOpacity = 0.25,
  variant = 'zoom_in',
}) => {
  const frame = useCurrentFrame()
  const { fps, height } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  // bail if outside range
  if (localFrame < 0 || localFrame > duration) return null

  // super smooth slow zoom using bezier easing
  const zoomProgress = interpolate(
    localFrame,
    [0, duration],
    [0, 1],
    { 
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  )

  // determine zoom based on direction/variant
  let scale = 1
  let translateX = 0
  let translateY = 0

  if (variant === 'zoom_in' || zoomDirection === 'in') {
    scale = interpolate(zoomProgress, [0, 1], [1, zoomTarget])
  } else if (variant === 'zoom_out' || zoomDirection === 'out') {
    scale = interpolate(zoomProgress, [0, 1], [zoomTarget, 1])
  } else if (variant === 'pan_left') {
    scale = 1.1
    translateX = interpolate(zoomProgress, [0, 1], [50, -50])
  } else if (variant === 'pan_right') {
    scale = 1.1
    translateX = interpolate(zoomProgress, [0, 1], [-50, 50])
  }

  // letterbox fade in/out
  const barOpacity = interpolate(
    localFrame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  )

  // vignette follows bar opacity
  const vignetteOp = vignette ? vignetteOpacity * barOpacity : 0

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* zoom/pan wrapper */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center',
        }}
      />

      {/* top letterbox bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: letterboxSize,
          backgroundColor: '#000',
          opacity: barOpacity,
        }}
      />

      {/* bottom letterbox bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: letterboxSize,
          backgroundColor: '#000',
          opacity: barOpacity,
        }}
      />

      {/* vignette overlay */}
      {vignette && vignetteOp > 0 && (
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)',
            opacity: vignetteOp,
          }}
        />
      )}
    </AbsoluteFill>
  )
}
