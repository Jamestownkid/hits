// EDIT RENDERER - this connects the brain to remotion
// brain tells us what edits to use, we load em and render em

import React, { Suspense, lazy, useMemo } from 'react'
import { AbsoluteFill, Sequence, useVideoConfig, Video } from 'remotion'
import { brain, RegisteredEdit } from './brain'
import { EditInstance, Scene, EditManifest } from '../types/manifest'

// re-export types for backwards compatibility
export type { EditInstance, Scene, EditManifest }

// component cache so we dont import the same component twice
const componentCache = new Map<string, React.LazyExoticComponent<any>>()

function getComponent(edit: RegisteredEdit): React.LazyExoticComponent<any> {
  if (!componentCache.has(edit.meta.id)) {
    // dynamically import the component - this is the magic
    const loader = () => import(/* @vite-ignore */ edit.componentPath)
    componentCache.set(edit.meta.id, lazy(loader))
  }
  return componentCache.get(edit.meta.id)!
}

// renders a single edit instance
interface EditRendererProps {
  instance: EditInstance
  fps: number
}

export const EditRenderer: React.FC<EditRendererProps> = ({ instance, fps }) => {
  const edit = brain.get(instance.editId)
  
  if (!edit) {
    console.warn(`[renderer] unknown edit: ${instance.editId} - check your /edits folder`)
    return null
  }

  // merge default props with the ones from manifest
  const mergedProps = {
    ...brain.getDefaultProps(instance.editId),
    ...instance.props,
    // always inject timing info so components can animate properly
    durationInFrames: Math.round(instance.duration * fps),
  }

  const Component = getComponent(edit)
  
  return (
    <Suspense fallback={null}>
      <Component {...mergedProps} />
    </Suspense>
  )
}

// renders all edits for a scene
interface SceneRendererProps {
  scene: Scene
  fps: number
  sceneStartFrame: number
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ 
  scene, 
  fps, 
  sceneStartFrame 
}) => {
  // group edits by layer for proper z-ordering
  const layers = useMemo(() => {
    const grouped: Record<number, EditInstance[]> = {}
    for (const edit of scene.edits) {
      const layer = edit.layer ?? 0
      if (!grouped[layer]) grouped[layer] = []
      grouped[layer].push(edit)
    }
    // sort by layer number so lower layers render first
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
  }, [scene.edits])

  return (
    <>
      {layers.map(([layerNum, edits]) => (
        <AbsoluteFill key={layerNum} style={{ zIndex: Number(layerNum) }}>
          {edits.map((edit, i) => {
            const editStartFrame = Math.round(edit.at * fps) - sceneStartFrame
            const editDurationFrames = Math.round(edit.duration * fps)
            
            return (
              <Sequence
                key={`${edit.editId}-${i}`}
                from={editStartFrame}
                durationInFrames={editDurationFrames}
              >
                <EditRenderer instance={edit} fps={fps} />
              </Sequence>
            )
          })}
        </AbsoluteFill>
      ))}
    </>
  )
}

// MAIN VIDEO COMPONENT - renders the full manifest
interface MainVideoProps {
  manifest: EditManifest
}

export const MainVideo: React.FC<MainVideoProps> = ({ manifest }) => {
  const { fps } = useVideoConfig()
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* source video as the base layer */}
      {manifest.sourceVideo && (
        <AbsoluteFill>
          <Video
            src={manifest.sourceVideo}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>
      )}
      
      {/* render each scene with its edits on top */}
      {manifest.scenes.map((scene, i) => {
        const sceneStartFrame = Math.round(scene.start * fps)
        const sceneDurationFrames = Math.round((scene.end - scene.start) * fps)
        
        return (
          <Sequence
            key={i}
            from={sceneStartFrame}
            durationInFrames={sceneDurationFrames}
          >
            <SceneRenderer 
              scene={scene} 
              fps={fps} 
              sceneStartFrame={sceneStartFrame}
            />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}

