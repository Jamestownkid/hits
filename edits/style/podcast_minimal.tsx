// PODCAST MINIMAL - subtle minimal effects
// for podcast/talking head content
// nothing crazy just clean vibes

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

interface PodcastMinimalProps {
  startFrame?: number
  endFrame?: number
  effectType?: 'waveform' | 'fade' | 'focus' | 'subtle_zoom'
  color?: string
  position?: 'bottom' | 'center' | 'top'
  barCount?: number
  sensitivity?: number
  variant?: string
}

export const PodcastMinimal: React.FC<PodcastMinimalProps> = ({
  startFrame = 0,
  endFrame = 90,
  effectType = 'waveform',
  color = '#3b82f6',
  position = 'bottom',
  barCount = 30,
  sensitivity = 1,
  variant,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  const effect = variant || effectType

  // subtle fade in/out
  const fadeOpacity = interpolate(
    localFrame,
    [0, 20, duration - 20, duration],
    [0, 0.8, 0.8, 0],
    { extrapolateRight: 'clamp' }
  )

  // waveform bars animation - smooth sine waves
  const bars = Array.from({ length: barCount }, (_, i) => {
    const phase = (i * 0.3) + (localFrame * 0.08)
    const heightMult = ((Math.sin(phase) + 1) / 2) * sensitivity
    return heightMult
  })

  // focus vignette for talking head
  const focusOpacity = effect === 'focus'
    ? 0.4 * fadeOpacity
    : 0

  // subtle zoom
  const subtleZoom = effect === 'subtle_zoom'
    ? interpolate(localFrame, [0, duration], [1, 1.03], {
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.4, 0, 0.2, 1)
      })
    : 1

  // position for waveform
  const getWaveformPosition = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      height: 50,
      opacity: fadeOpacity,
    }

    if (position === 'bottom') base.bottom = 50
    else if (position === 'top') base.top = 50
    else base.top = '50%'

    return base
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* subtle zoom wrapper */}
      {effect === 'subtle_zoom' && (
        <AbsoluteFill
          style={{
            transform: `scale(${subtleZoom})`,
            transformOrigin: 'center',
          }}
        />
      )}

      {/* waveform visualizer */}
      {effect === 'waveform' && (
        <div style={getWaveformPosition()}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: `${15 + h * 70}%`,
                backgroundColor: color,
                borderRadius: 3,
                transition: 'height 0.1s ease-out',
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      )}

      {/* fade overlay */}
      {effect === 'fade' && (
        <AbsoluteFill
          style={{
            backgroundColor: '#000',
            opacity: fadeOpacity * 0.15,
          }}
        />
      )}

      {/* focus vignette - soft edges */}
      {effect === 'focus' && focusOpacity > 0 && (
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse 70% 70% at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
            opacity: focusOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  )
}
