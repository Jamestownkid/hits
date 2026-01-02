// WAVEFORM - audio waveform visualization
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const Waveform = ({ color = '#0f0', height = 100 }: { color?: string; height?: number }) => {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const points = [...Array(100)].map((_, i) => {
    const x = (i / 100) * width
    const y = Math.sin(frame * 0.1 + i * 0.2) * height/2 + height
    return `${x},${y}`
  }).join(' ')
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="100%" height={height * 2} style={{ position: 'absolute', bottom: 0 }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="3" />
      </svg>
    </AbsoluteFill>
  )
}

