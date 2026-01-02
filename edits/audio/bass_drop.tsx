// BASS DROP - visual effect synced to bass
// that screen shake/flash on the drop

import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Audio } from 'remotion'

interface BassDropProps {
  intensity?: number
  withFlash?: boolean
  audioFile?: string
  durationInFrames: number
}

export const BassDrop: React.FC<BassDropProps> = ({
  intensity = 1,
  withFlash = true,
  audioFile,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  // dramatic shake at start
  const shake = frame < 10
    ? Math.sin(frame * 3) * intensity * 20
    : 0
  
  // zoom pulse
  const scale = interpolate(frame, [0, 5, 15], [1.2 * intensity, 0.95, 1], {
    extrapolateRight: 'clamp'
  })
  
  // flash opacity
  const flash = withFlash
    ? interpolate(frame, [0, 3, 10], [1, 0.8, 0], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill>
      {audioFile && <Audio src={audioFile} />}
      <AbsoluteFill
        style={{
          transform: `translateX(${shake}px) scale(${scale})`,
          transformOrigin: 'center'
        }}
      />
      {withFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            opacity: flash
          }}
        />
      )}
    </AbsoluteFill>
  )
}

export default BassDrop

