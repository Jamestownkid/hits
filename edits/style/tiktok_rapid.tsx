// TIKTOK RAPID - super fast cuts and zooms
// for that rapid fire tiktok energy fr fr
// if ur attention span is shot this is for u

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface TikTokRapidProps {
  startFrame?: number
  endFrame?: number
  cutType?: 'zoom' | 'pan' | 'flash' | 'whip'
  speed?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  color?: string
  intensity?: number
  variant?: string
}

export const TikTokRapid: React.FC<TikTokRapidProps> = ({
  startFrame = 0,
  endFrame = 8,
  cutType = 'zoom',
  speed = 2,
  direction = 'right',
  color = '#ffffff',
  intensity = 1,
  variant,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  // use variant if provided
  const effectType = variant || cutType

  // super quick zoom with spring for snap
  const zoomSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 300 },
  })

  const zoomScale = effectType === 'zoom'
    ? interpolate(zoomSpring, [0, 1], [1, 1.4 * intensity])
    : 1

  // zoom back
  const zoomOut = interpolate(
    localFrame,
    [duration * 0.4, duration],
    [zoomScale, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const finalZoom = effectType === 'zoom' && localFrame > duration * 0.4 ? zoomOut : zoomScale

  // pan/whip movement
  let panX = 0, panY = 0
  if (effectType === 'pan' || effectType === 'whip') {
    const panAmount = effectType === 'whip' ? 200 * speed : 100 * speed
    const panProgress = interpolate(localFrame, [0, duration], [0, 1], { extrapolateRight: 'clamp' })
    
    switch (direction) {
      case 'left': panX = panProgress * panAmount; break
      case 'right': panX = -panProgress * panAmount; break
      case 'up': panY = panProgress * panAmount; break
      case 'down': panY = -panProgress * panAmount; break
    }
  }

  // flash opacity
  const flashOpacity = effectType === 'flash'
    ? interpolate(localFrame, [0, duration * 0.15, duration], [0.9 * intensity, 0.3, 0], { extrapolateRight: 'clamp' })
    : 0

  // motion blur for whip
  const blurAmount = effectType === 'whip'
    ? interpolate(localFrame, [0, duration * 0.3, duration], [0, 8, 0], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* zoom/pan wrapper */}
      <AbsoluteFill
        style={{
          transform: `scale(${finalZoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center',
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
        }}
      />

      {/* flash */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity: flashOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  )
}
