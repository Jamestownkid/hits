// TEXT 3D - 3D extruded text
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const Text3D = ({ text = 'EPIC' }: { text?: string }) => {
  const frame = useCurrentFrame()
  const rotateY = interpolate(frame, [0, 60], [0, 360], { extrapolateRight: 'extend' })
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1000 }}>
      <span style={{
        fontSize: 120,
        fontWeight: 900,
        color: '#fff',
        transform: `rotateY(${rotateY}deg)`,
        textShadow: Array(10).fill(0).map((_, i) => `${i}px ${i}px 0 rgba(0,0,0,${0.5 - i * 0.05})`).join(',')
      }}>{text}</span>
    </AbsoluteFill>
  )
}

