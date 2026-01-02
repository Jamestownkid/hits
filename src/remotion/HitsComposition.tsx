// HITS COMPOSITION - main remotion composition
// wraps the dynamic renderer for actual video output

import React from 'react'
import { Composition } from 'remotion'
import { MainVideo, EditManifest } from '../core/renderer'

// default props for preview
const defaultManifest: EditManifest = {
  mode: 'lemmino',
  duration: 30,
  fps: 30,
  width: 1920,
  height: 1080,
  sourceVideo: '',
  scenes: []
}

export const HitsComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="HitsVideo"
        component={MainVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          manifest: defaultManifest
        }}
        calculateMetadata={({ props }) => {
          const manifest = props.manifest || defaultManifest
          return {
            durationInFrames: Math.round(manifest.duration * manifest.fps),
            fps: manifest.fps,
            width: manifest.width,
            height: manifest.height
          }
        }}
      />
    </>
  )
}

