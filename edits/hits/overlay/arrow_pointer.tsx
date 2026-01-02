// ARROW POINTER - pointing arrow
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion'

export const ArrowPointer = ({ x = 50, y = 50, direction = 'down' }: { x?: number; y?: number; direction?: string }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, from: 0, to: 1 })
  const bounce = Math.sin(frame * 0.3) * 10
  
  const rotation = direction === 'up' ? -90 : direction === 'left' ? 180 : direction === 'right' ? 0 : 90
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale}) rotate(${rotation}deg) translateY(${bounce}px)`,
        fontSize: 60
      }}>➡️</div>
    </AbsoluteFill>
  )
}

