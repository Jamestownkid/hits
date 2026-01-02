// PROGRESS BAR - animated progress indicator
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const ProgressBar = ({ color = '#0f0' }: { color?: string }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`
        }} />
      </div>
    </AbsoluteFill>
  )
}

