// CIRCLE PULSE - pulsing circle visualizer
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const CirclePulse = ({ color = '#f0f' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const size = 100 + Math.sin(frame * 0.2) * 50
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `4px solid ${color}`,
        boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}`,
        opacity: 0.8
      }} />
    </AbsoluteFill>
  )
}

