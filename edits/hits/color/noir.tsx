// NOIR - black and white noir style
import { AbsoluteFill } from 'remotion'

export const Noir = ({ children }: { children?: React.ReactNode }) => {
  return (
    <AbsoluteFill style={{ filter: `grayscale(1) contrast(1.2) brightness(0.9)` }}>
      {children}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  )
}

