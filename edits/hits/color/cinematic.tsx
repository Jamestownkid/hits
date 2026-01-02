// CINEMATIC - cinematic color grade
import { AbsoluteFill } from 'remotion'

export const Cinematic = ({ children }: { children?: React.ReactNode }) => {
  return (
    <AbsoluteFill style={{ filter: `contrast(1.1) saturate(0.9)` }}>
      {children}
      <AbsoluteFill style={{
        background: 'linear-gradient(to bottom, rgba(0,20,50,0.3), transparent 30%, transparent 70%, rgba(0,20,50,0.3))',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  )
}

