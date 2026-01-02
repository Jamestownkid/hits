// SPLIT SCREEN - side by side comparison
import { AbsoluteFill, Img, useCurrentFrame, interpolate, useVideoConfig } from 'remotion'

export const SplitScreen = ({ src }: { src: string }) => {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const splitPos = interpolate(frame, [0, 20], [width, width/2], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill>
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: width - splitPos,
        overflow: 'hidden'
      }}>
        <Img src={src} style={{ 
          position: 'absolute',
          right: 0,
          width: width,
          height: '100%',
          objectFit: 'cover'
        }} />
      </div>
      <div style={{
        position: 'absolute',
        left: splitPos,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#fff'
      }} />
    </AbsoluteFill>
  )
}

