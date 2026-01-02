// DOCUMENTARY BROLL - classic b-roll transition
// smooth crossfade with ken burns effect
// makes ur video look actually professional

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Img, Easing } from 'remotion'

interface DocumentaryBrollProps {
  startFrame?: number
  endFrame?: number
  imageSrc?: string
  zoomDirection?: 'in' | 'out'
  fadeTime?: number
  zoomAmount?: number
  overlayOpacity?: number
  variant?: 'fade_zoom_in' | 'fade_zoom_out' | 'crossfade' | 'slide_in'
}

export const DocumentaryBroll: React.FC<DocumentaryBrollProps> = ({
  startFrame = 0,
  endFrame = 90,
  imageSrc,
  zoomDirection = 'in',
  fadeTime = 30,
  zoomAmount = 1.15,
  overlayOpacity = 1,
  variant = 'fade_zoom_in',
}) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  // fade in/out curve
  const opacity = interpolate(
    localFrame,
    [0, fadeTime, duration - fadeTime, duration],
    [0, overlayOpacity, overlayOpacity, 0],
    { extrapolateRight: 'clamp' }
  ) 

  // ken burns zoom
  const zoomProgress = interpolate(
    localFrame,
    [0, duration],
    [0, 1],
    { 
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1)
    }
  )

  let scale = 1
  let translateX = 0

  switch (variant) {
    case 'fade_zoom_in':
      scale = interpolate(zoomProgress, [0, 1], [1, zoomAmount])
      break
    case 'fade_zoom_out':
      scale = interpolate(zoomProgress, [0, 1], [zoomAmount, 1])
      break
    case 'slide_in':
      scale = 1.1
      translateX = interpolate(zoomProgress, [0, 1], [width * 0.1, 0])
      break
    case 'crossfade':
    default:
      scale = zoomDirection === 'in' 
        ? interpolate(zoomProgress, [0, 1], [1, zoomAmount])
        : interpolate(zoomProgress, [0, 1], [zoomAmount, 1])
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        overflow: 'hidden',
      }}
    >
      {imageSrc ? (
        <Img
          src={imageSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translateX(${translateX}px)`,
            transformOrigin: 'center',
          }}
        />
      ) : (
        // placeholder gradient if no image
        <AbsoluteFill
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
          }}
        />
      )}
    </AbsoluteFill>
  )
}
