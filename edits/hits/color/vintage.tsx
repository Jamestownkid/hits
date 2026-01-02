// VINTAGE - vintage film look
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const Vintage = ({ children }: { children?: React.ReactNode }) => {
  const frame = useCurrentFrame()
  const flicker = 1 + (Math.random() - 0.5) * 0.05 * (frame % 3 === 0 ? 1 : 0)
  
  return (
    <AbsoluteFill style={{ filter: `sepia(0.4) contrast(1.1) brightness(${flicker})` }}>
      {children}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(139,90,43,0.3) 100%)',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  )
}

