// SOUND HIT - plays a sound effect
// synced to video moments for that satisfying hit

import React from 'react'
import { Audio, useVideoConfig } from 'remotion'

interface SoundHitProps {
  src: string
  volume?: number
  startFrom?: number
  durationInFrames: number
}

export const SoundHit: React.FC<SoundHitProps> = ({
  src,
  volume = 1,
  startFrom = 0,
  durationInFrames
}) => {
  const { fps } = useVideoConfig()

  if (!src) return null

  return (
    <Audio
      src={src}
      volume={volume}
      startFrom={startFrom}
      endAt={startFrom + durationInFrames / fps}
    />
  )
}

export default SoundHit

