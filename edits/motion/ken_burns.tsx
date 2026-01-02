// KEN BURNS - slow pan and zoom for documentary feel
// makes static images feel cinematic

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion'

interface KenBurnsProps {
  src?: string
  direction?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right'
  amount?: number
  durationInFrames: number
}

export const KenBurns: React.FC<KenBurnsProps> = ({
  src,
  direction = 'zoom-in',
  amount = 0.1,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp'
  })

  let transform = ''

  switch (direction) {
    case 'zoom-in':
      const scaleIn = 1 + progress * amount
      transform = `scale(${scaleIn})`
      break
    case 'zoom-out':
      const scaleOut = 1 + amount - progress * amount
      transform = `scale(${scaleOut})`
      break
    case 'pan-left':
      const translateLeft = progress * amount * 100
      transform = `translateX(-${translateLeft}%) scale(1.1)`
      break
    case 'pan-right':
      const translateRight = progress * amount * 100
      transform = `translateX(${translateRight}%) scale(1.1)`
      break
  }

  return (
    <AbsoluteFill
      style={{
        transform,
        transformOrigin: 'center center'
      }}
    >
      {src && (
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </AbsoluteFill>
  )
}

export default KenBurns

