// IMAGE DROP - drops an image onto the video
// good for b-roll overlays and reaction images

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img } from 'remotion'

interface ImageDropProps {
  src: string
  position?: 'center' | 'left' | 'right' | 'corner'
  size?: number
  animation?: 'drop' | 'fade' | 'scale'
  durationInFrames: number
}

export const ImageDrop: React.FC<ImageDropProps> = ({
  src,
  position = 'center',
  size = 40,
  animation = 'drop',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    center: { justifyContent: 'center', alignItems: 'center' },
    left: { justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '10%' },
    right: { justifyContent: 'flex-end', alignItems: 'center', paddingRight: '10%' },
    corner: { justifyContent: 'flex-end', alignItems: 'flex-start', padding: '5%' },
  }

  // animation
  let animStyle: React.CSSProperties = {}
  
  switch (animation) {
    case 'drop': {
      const drop = spring({
        fps,
        frame,
        config: { damping: 12, stiffness: 100 },
        durationInFrames: Math.min(durationInFrames, 15)
      })
      animStyle = {
        transform: `translateY(${interpolate(drop, [0, 1], [-100, 0])}px) scale(${drop})`,
        opacity: drop
      }
      break
    }
    case 'fade': {
      const fade = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
      animStyle = { opacity: fade }
      break
    }
    case 'scale': {
      const scale = spring({
        fps,
        frame,
        config: { damping: 15, stiffness: 120 },
        durationInFrames: Math.min(durationInFrames, 12)
      })
      animStyle = {
        transform: `scale(${scale})`,
        opacity: scale
      }
      break
    }
  }

  if (!src) return null

  return (
    <AbsoluteFill style={{ display: 'flex', ...positionStyles[position] }}>
      <Img
        src={src}
        style={{
          width: `${size}%`,
          height: 'auto',
          objectFit: 'contain',
          borderRadius: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          ...animStyle
        }}
      />
    </AbsoluteFill>
  )
}

export default ImageDrop

