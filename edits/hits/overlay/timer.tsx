// TIMER - countdown/up timer
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'

export const Timer = ({ countdown = false }: { countdown?: boolean }) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  
  const totalSeconds = countdown 
    ? Math.ceil((durationInFrames - frame) / fps)
    : Math.floor(frame / fps)
  
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const time = `${mins}:${secs.toString().padStart(2, '0')}`
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 8,
        fontSize: 24,
        fontFamily: 'monospace',
        fontWeight: 700
      }}>{time}</div>
    </AbsoluteFill>
  )
}

