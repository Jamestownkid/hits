// GAMING MONTAGE - fast hype edits for gaming content
// RGB, glitch, speed ramps - the whole nine yards
// for when u hit that nasty clip

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface GamingMontageProps {
  startFrame?: number
  endFrame?: number
  effectType?: 'rgb' | 'speed' | 'glitch' | 'flash' | 'shake'
  intensity?: number
  color?: string
  glitchFrequency?: number
  variant?: string
}

export const GamingMontage: React.FC<GamingMontageProps> = ({
  startFrame = 0,
  endFrame = 12,
  effectType = 'rgb',
  intensity = 1,
  color = '#ff00ff',
  glitchFrequency = 0.3,
  variant,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  // use variant if provided (convert variant names)
  let effect = effectType
  if (variant) {
    if (variant === 'rgb_split') effect = 'rgb'
    else if (variant === 'speed_zoom') effect = 'speed'
    else effect = variant as any
  }

  // RGB chromatic aberration offset - quick burst
  const rgbProgress = interpolate(localFrame, [0, duration * 0.3, duration], [0, 1, 0], { extrapolateRight: 'clamp' })
  const rgbOffset = effect === 'rgb' ? rgbProgress * 12 * intensity : 0

  // speed zoom with spring
  const speedSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 8, stiffness: 250 },
  })
  
  const speedZoom = effect === 'speed'
    ? interpolate(speedSpring, [0, 1], [1, 1.5 * intensity])
    : 1

  // zoom back out
  const speedZoomOut = interpolate(
    localFrame,
    [duration * 0.4, duration],
    [speedZoom, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const finalSpeedZoom = effect === 'speed' && localFrame > duration * 0.4 ? speedZoomOut : speedZoom

  // glitch offset - random based on frequency
  const glitchRand = Math.sin(localFrame * 13.37) // pseudo random
  const shouldGlitch = glitchRand > (1 - glitchFrequency)
  const glitchX = effect === 'glitch' && shouldGlitch
    ? (glitchRand - 0.5) * 40 * intensity
    : 0
  const glitchY = effect === 'glitch' && shouldGlitch
    ? Math.cos(localFrame * 7.77) * 20 * intensity
    : 0

  // shake
  const shakeDecay = 1 - (localFrame / duration)
  const shakeX = effect === 'shake' ? Math.sin(localFrame * 4) * 10 * intensity * shakeDecay : 0
  const shakeY = effect === 'shake' ? Math.cos(localFrame * 5) * 8 * intensity * shakeDecay : 0

  // flash
  const flashOpacity = effect === 'flash'
    ? interpolate(localFrame, [0, duration * 0.1, duration], [0.8 * intensity, 0.2, 0], { extrapolateRight: 'clamp' })
    : 0

  // glitch color bars
  const glitchBars = effect === 'glitch' && shouldGlitch

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* zoom/glitch/shake wrapper */}
      <AbsoluteFill
        style={{
          transform: `scale(${finalSpeedZoom}) translate(${glitchX + shakeX}px, ${glitchY + shakeY}px)`,
          transformOrigin: 'center',
        }}
      />

      {/* RGB split effect */}
      {effect === 'rgb' && rgbOffset > 0 && (
        <>
          <AbsoluteFill
            style={{
              backgroundColor: 'red',
              mixBlendMode: 'multiply',
              transform: `translateX(${-rgbOffset}px)`,
              opacity: 0.6,
            }}
          />
          <AbsoluteFill
            style={{
              backgroundColor: 'cyan',
              mixBlendMode: 'multiply',
              transform: `translateX(${rgbOffset}px)`,
              opacity: 0.6,
            }}
          />
        </>
      )}

      {/* flash */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity: flashOpacity,
          }}
        />
      )}

      {/* glitch color bars */}
      {glitchBars && (
        <>
          <div
            style={{
              position: 'absolute',
              top: `${30 + glitchRand * 40}%`,
              left: 0,
              right: 0,
              height: 4 + glitchRand * 10,
              backgroundColor: '#ff0000',
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: `${50 + glitchRand * 30}%`,
              left: 0,
              right: 0,
              height: 2 + glitchRand * 6,
              backgroundColor: '#00ff00',
              opacity: 0.5,
            }}
          />
        </>
      )}

      {/* scanlines for that retro gaming feel */}
      {effect === 'glitch' && (
        <AbsoluteFill
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)',
            opacity: 0.5,
          }}
        />
      )}
    </AbsoluteFill>
  )
}
