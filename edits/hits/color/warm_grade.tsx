// WARM GRADE - orange/warm color grade
import { AbsoluteFill } from 'remotion'

export const WarmGrade = ({ intensity = 0.3, children }: { intensity?: number; children?: React.ReactNode }) => {
  return (
    <AbsoluteFill style={{ filter: `sepia(0.1) saturate(1.3) hue-rotate(10deg)` }}>
      {children}
      <AbsoluteFill style={{ backgroundColor: `rgba(255, 150, 50, ${intensity})`, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </AbsoluteFill>
  )
}

