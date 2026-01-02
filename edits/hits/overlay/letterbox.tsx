// LETTERBOX - cinematic black bars
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Letterbox = ({ size = 80 }: { size?: number }) => {
  const frame = useCurrentFrame()
  const barSize = interpolate(frame, [0, 15], [0, size], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barSize, backgroundColor: '#000' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barSize, backgroundColor: '#000' }} />
    </AbsoluteFill>
  )
}

