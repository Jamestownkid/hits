// SUBSCRIBE BUTTON - animated subscribe CTA
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const SubscribeButton = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 8 } })
  const pulse = 1 + Math.sin(frame * 0.3) * 0.05
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 80, pointerEvents: 'none' }}>
      <div style={{
        transform: `scale(${scale * pulse})`,
        backgroundColor: '#f00',
        color: '#fff',
        padding: '16px 40px',
        borderRadius: 8,
        fontSize: 24,
        fontWeight: 800,
        boxShadow: '0 4px 20px rgba(255,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        🔔 SUBSCRIBE
      </div>
    </AbsoluteFill>
  )
}

