// SPECTRUM - circular spectrum analyzer
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Spectrum = ({ bars = 32, color = '#ff0' }: { bars?: number; color?: string }) => {
  const frame = useCurrentFrame()
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {[...Array(bars)].map((_, i) => {
        const angle = (i / bars) * 360
        const length = 50 + Math.abs(Math.sin(frame * 0.15 + i * 0.3)) * 80
        return (
          <div key={i} style={{
            position: 'absolute',
            width: 4,
            height: length,
            backgroundColor: color,
            transformOrigin: 'center bottom',
            transform: `rotate(${angle}deg) translateY(-${100 + length/2}px)`,
            borderRadius: 2
          }} />
        )
      })}
    </AbsoluteFill>
  )
}

