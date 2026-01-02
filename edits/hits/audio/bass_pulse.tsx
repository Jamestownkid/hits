// BASS PULSE - visual pulse on bass hits
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const BassPulse = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const beat = Math.floor(frame / 15) % 2
  const scale = beat === 0 ? interpolate(frame % 15, [0, 5, 15], [1, 1.05, 1]) : 1
  
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  )
}

