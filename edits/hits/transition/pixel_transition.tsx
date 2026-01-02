// PIXEL TRANSITION - pixelated transition effect
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

export const PixelTransition = () => {
  const frame = useCurrentFrame()
  const pixelSize = interpolate(frame, [0, 10, 20], [1, 50, 1], { extrapolateRight: 'clamp' })
  
  return (
    <AbsoluteFill style={{ 
      backdropFilter: `blur(0px)`,
      filter: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='p'><feFlood flood-color='%23000' flood-opacity='${frame < 10 ? frame/10 : 1-((frame-10)/10)}'/></filter></svg>#p")`,
      imageRendering: 'pixelated'
    }} />
  )
}

