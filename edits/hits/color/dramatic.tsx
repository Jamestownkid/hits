// DRAMATIC - high contrast dramatic look
import { AbsoluteFill } from 'remotion'

export const Dramatic = ({ children }: { children?: React.ReactNode }) => {
  return (
    <AbsoluteFill style={{ filter: `contrast(1.3) brightness(0.95) saturate(0.8)` }}>
      {children}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  )
}

