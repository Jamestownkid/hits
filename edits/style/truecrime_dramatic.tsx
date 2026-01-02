// TRUECRIME DRAMATIC - dark dramatic effects
// for that true crime tension and suspense
// makes everything feel like a netflix doc lol

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

interface TrueCrimeDramaticProps {
  startFrame?: number
  endFrame?: number
  effectType?: 'darken' | 'vignette' | 'shake' | 'flicker'
  intensity?: number
  color?: string
  flickerSpeed?: number
  variant?: string
}

export const TrueCrimeDramatic: React.FC<TrueCrimeDramaticProps> = ({
  startFrame = 0,
  endFrame = 45,
  effectType = 'vignette',
  intensity = 1,
  color = '#000000',
  flickerSpeed = 0.8,
  variant,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  // use variant if provided
  const effect = variant || effectType

  // fade in/out for all effects
  const fadeOpacity = interpolate(
    localFrame,
    [0, 10, duration - 10, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  )

  // darken effect
  const darkenOpacity = effect === 'darken'
    ? 0.5 * intensity * fadeOpacity
    : 0

  // vignette effect (intensifies over time)
  const vignetteOpacity = effect === 'vignette'
    ? interpolate(localFrame, [0, duration * 0.5], [0.4, 0.8], { extrapolateRight: 'clamp' }) * intensity * fadeOpacity
    : 0

  // shake effect - subtle horror shake
  const shakeIntensity = effect === 'shake' ? intensity * fadeOpacity : 0
  const shakeX = shakeIntensity * Math.sin(localFrame * 6) * 3
  const shakeY = shakeIntensity * Math.cos(localFrame * 5) * 2

  // flicker effect - random light flashes
  const flickerSeed = Math.sin(localFrame * flickerSpeed * 10)
  const flickerOpacity = effect === 'flicker' && flickerSeed > 0.7
    ? interpolate(flickerSeed, [0.7, 1], [0, 0.4 * intensity * fadeOpacity])
    : 0

  // slow zoom for dramatic effect
  const slowZoom = effect === 'slow_zoom'
    ? interpolate(localFrame, [0, duration], [1, 1.08], { 
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.4, 0, 0.2, 1)
      })
    : 1

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* shake/zoom wrapper */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${slowZoom})`,
          transformOrigin: 'center',
        }}
      />

      {/* darken overlay */}
      {effect === 'darken' && darkenOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity: darkenOpacity,
          }}
        />
      )}

      {/* vignette */}
      {effect === 'vignette' && vignetteOpacity > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 20%, ${color} 100%)`,
            opacity: vignetteOpacity,
          }}
        />
      )}

      {/* flicker */}
      {flickerOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: '#fff',
            opacity: flickerOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* scanlines for extra creepy */}
      {(effect === 'vignette' || effect === 'flicker') && fadeOpacity > 0.5 && (
        <AbsoluteFill
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
            opacity: 0.3 * fadeOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  )
}
