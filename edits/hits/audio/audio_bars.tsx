// AUDIO BARS - visualizer bars
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const AudioBars = ({ bars = 20, color = '#0ff' }: { bars?: number; color?: string }) => {
  const frame = useCurrentFrame()
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: 40, pointerEvents: 'none' }}>
      {[...Array(bars)].map((_, i) => {
        const height = 20 + Math.abs(Math.sin(frame * 0.1 + i * 0.5)) * 100
        return (
          <div key={i} style={{
            width: 8,
            height,
            backgroundColor: color,
            borderRadius: 4,
            boxShadow: `0 0 10px ${color}`
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

