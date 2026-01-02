// TEXT TYPEWRITER - types out character by character
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const TextTypewriter = ({ text = 'Hello World', speed = 2 }: { text?: string; speed?: number }) => {
  const frame = useCurrentFrame()
  const chars = Math.floor(frame / speed)
  const displayText = text.slice(0, chars)
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 60,
        fontFamily: 'monospace',
        color: '#0f0',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '20px 40px'
      }}>{displayText}<span style={{ opacity: frame % 20 > 10 ? 1 : 0 }}>|</span></span>
    </AbsoluteFill>
  )
}

