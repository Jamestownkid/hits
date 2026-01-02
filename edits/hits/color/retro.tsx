// RETRO - retro VHS look
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Retro = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const chromatic = frame % 3 === 0 ? 2 : 0
  
  return (
    <AbsoluteFill style={{ filter: `saturate(1.3) contrast(1.1) sepia(0.2)` }}>
      {children}
      <AbsoluteFill style={{
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`,
        pointerEvents: 'none'
      }} />
      <AbsoluteFill style={{
        boxShadow: `inset ${chromatic}px 0 rgba(255,0,0,0.1), inset ${-chromatic}px 0 rgba(0,255,255,0.1)`,
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  )
}

