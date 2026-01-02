// VOX ANIMATED - animated text like vox explainers
// text slides in with that clean vox style
// makes complex topics look simple and clean

import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'

interface VoxAnimatedProps {
  startFrame?: number
  endFrame?: number
  text?: string
  position?: 'left' | 'center' | 'right'
  size?: number
  color?: string
  bgColor?: string
  animate?: 'slide' | 'pop' | 'type' | 'fade'
  shadow?: boolean
  variant?: string
}

export const VoxAnimated: React.FC<VoxAnimatedProps> = ({
  startFrame = 0,
  endFrame = 60,
  text = 'Key Point',
  position = 'left',
  size = 64,
  color = '#ffffff',
  bgColor = '#1a1a2e',
  animate = 'slide',
  shadow = true,
  variant,
}) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  // use variant if provided
  const animType = variant?.replace('slide_left', 'slide').replace('slide_right', 'slide') || animate

  // slide animation
  const slideProgress = interpolate(
    localFrame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  )

  const slideX = animType === 'slide'
    ? interpolate(
        slideProgress,
        [0, 1],
        position === 'left' ? [-100, 0] : position === 'right' ? [100, 0] : [0, 0]
      )
    : 0

  // pop animation using spring
  const popScale = animType === 'pop'
    ? spring({
        frame: localFrame,
        fps,
        config: { damping: 12, stiffness: 200 },
      })
    : 1

  // fade animation
  const fadeOpacity = animType === 'fade'
    ? interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
    : 1

  // type animation - characters revealed
  const charsToShow = animType === 'type'
    ? Math.floor(interpolate(localFrame, [0, duration * 0.6], [0, text.length], { extrapolateRight: 'clamp' }))
    : text.length

  // fade out at end
  const outOpacity = interpolate(
    localFrame,
    [duration - 15, duration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // position styles
  const getPositionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      bottom: 200,
      padding: '20px 40px',
      backgroundColor: bgColor,
      opacity: outOpacity * fadeOpacity,
      transform: `translateX(${slideX}%) scale(${popScale})`,
      transformOrigin: position === 'center' ? 'center' : position === 'left' ? 'left center' : 'right center',
      boxShadow: shadow ? `0 8px 32px ${bgColor}80` : undefined,
      borderRadius: 4,
    }

    if (position === 'left') {
      base.left = 60
    } else if (position === 'right') {
      base.right = 60
    } else {
      base.left = '50%'
      base.transform = `translateX(-50%) translateX(${slideX}%) scale(${popScale})`
    }

    return base
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={getPositionStyle()}>
        <span
          style={{
            fontSize: size,
            fontWeight: 'bold',
            color,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {animType === 'type' ? text.slice(0, charsToShow) : text}
          {animType === 'type' && localFrame % 30 < 15 && charsToShow < text.length && (
            <span style={{ opacity: 0.7, marginLeft: 2 }}>|</span>
          )}
        </span>
      </div>
    </AbsoluteFill>
  )
}
