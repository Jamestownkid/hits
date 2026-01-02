// COLD GRADE - blue/cold color grade
import { AbsoluteFill } from 'remotion'

export const ColdGrade = ({ intensity = 0.3, children }: { intensity?: number; children?: React.ReactNode }) => {
  return (
    <AbsoluteFill style={{ filter: `sepia(0.2) saturate(1.2) hue-rotate(-10deg)` }}>
      {children}
      <AbsoluteFill style={{ backgroundColor: `rgba(0, 100, 200, ${intensity})`, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </AbsoluteFill>
  )
}

