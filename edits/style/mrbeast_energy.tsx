// MRBEAST ENERGY - high energy zoom and shake combo
// this one goes HARD when keywords hit
// bro this effect is CRAZY no cap

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'

interface MrBeastEnergyProps {
  startFrame?: number
  endFrame?: number
  intensity?: number
  shakeAmount?: number
  zoomPeak?: number
  color?: string
  variant?: 'zoom_shake' | 'flash_zoom' | 'shake_only' | 'mega_zoom'
}

export const MrBeastEnergy: React.FC<MrBeastEnergyProps> = ({
  startFrame = 0,
  endFrame = 15,
  intensity = 1,
  shakeAmount = 15,
  zoomPeak = 1.3,
  color = '#ff0000',
  variant = 'zoom_shake',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // calculate local frame within effect
  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  // bail if outside our time range
  if (localFrame < 0 || localFrame > duration) return null

  // quick zoom in and out - spring for that snap
  const zoomSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 8, stiffness: 200 },
  })

  const zoom = variant === 'mega_zoom'
    ? interpolate(zoomSpring, [0, 1], [1, zoomPeak * 1.5 * intensity])
    : variant === 'shake_only'
    ? 1
    : interpolate(zoomSpring, [0, 1], [1, zoomPeak * intensity])

  // zoom back down
  const zoomOut = interpolate(
    localFrame,
    [duration * 0.4, duration],
    [zoom, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const finalZoom = localFrame > duration * 0.4 ? zoomOut : zoom

  // random shake - gets less intense over time
  const shakeDecay = 1 - (localFrame / duration)
  const shakeX = Math.sin(localFrame * 2.5) * shakeAmount * intensity * shakeDecay
  const shakeY = Math.cos(localFrame * 3.1) * shakeAmount * intensity * shakeDecay

  // flash opacity - quick burst at start
  const flashOpacity = variant !== 'shake_only'
    ? interpolate(
        localFrame,
        [0, duration * 0.1, duration * 0.4],
        [0.7 * intensity, 0.4, 0],
        { extrapolateRight: 'clamp' }
      )
    : 0

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* zoom/shake wrapper */}
      <AbsoluteFill
        style={{
          transform: `scale(${finalZoom}) translate(${shakeX}px, ${shakeY}px)`,
          transformOrigin: 'center',
        }}
      />

      {/* flash overlay */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity: flashOpacity,
          }}
        />
      )}

      {/* extra impact ring for mega_zoom */}
      {variant === 'mega_zoom' && localFrame < duration * 0.3 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 200 + localFrame * 50,
              height: 200 + localFrame * 50,
              borderRadius: '50%',
              border: `4px solid ${color}`,
              opacity: 1 - localFrame / (duration * 0.3),
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
