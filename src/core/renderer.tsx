// EDIT RENDERER - this connects the brain to remotion
// brain tells us what edits to use, we load em and render em
// NOW WITH PROPER NULL CHECKS cause undefined.map() is a pain

import React, { Suspense, lazy, useMemo } from 'react'
import { AbsoluteFill, Sequence, useVideoConfig, Video, Img, Audio } from 'remotion'
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
  // SAFETY CHECK - edits might be undefined
  const edits = scene.edits || []
  
  // group edits by layer for proper z-ordering
  const layers = useMemo(() => {
    const grouped: Record<number, EditInstance[]> = {}
    for (const edit of edits) {
      const layer = edit.layer ?? 0
      if (!grouped[layer]) grouped[layer] = []
      grouped[layer].push(edit)
    }
    // sort by layer number so lower layers render first
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
  }, [edits])

  return (
    <>
      {layers.map(([layerNum, layerEdits]) => (
        <AbsoluteFill key={layerNum} style={{ zIndex: Number(layerNum) }}>
          {layerEdits.map((edit, i) => {
            const editStartFrame = Math.round(edit.at * fps) - sceneStartFrame
            const editDurationFrames = Math.round(edit.duration * fps)
            
            return (
              <Sequence
                key={`${edit.editId}-${i}`}
                from={Math.max(0, editStartFrame)}
                durationInFrames={Math.max(1, editDurationFrames)}
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

// SIMPLE TEXT OVERLAY - fallback when no fancy edits
const SimpleTextOverlay: React.FC<{ text: string }> = ({ text }) => {
  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'center',
      paddingBottom: 80 
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        padding: '16px 32px',
        borderRadius: 8,
        maxWidth: '80%'
      }}>
        <p style={{ color: 'white', fontSize: 32, margin: 0, textAlign: 'center' }}>
          {text}
        </p>
      </div>
    </AbsoluteFill>
  )
}

// MAIN VIDEO COMPONENT - renders the full manifest
interface MainVideoProps {
  manifest: EditManifest
}

export const MainVideo: React.FC<MainVideoProps> = ({ manifest }) => {
  const { fps, width, height } = useVideoConfig()
  
  // SAFETY: default scenes to empty array
  const scenes = manifest.scenes || []
  
  console.log('[MainVideo] rendering manifest:', {
    mode: manifest.mode,
    duration: manifest.duration,
    scenesCount: scenes.length,
    sourceVideo: manifest.sourceVideo
  })
  
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
      
      {/* if no source video, show a placeholder */}
      {!manifest.sourceVideo && (
        <AbsoluteFill style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color: '#666', fontSize: 24 }}>
            No source video - audio only mode
          </div>
        </AbsoluteFill>
      )}
      
      {/* render each scene with its edits on top */}
      {scenes.length > 0 ? (
        scenes.map((scene, i) => {
          const sceneStartFrame = Math.round(scene.start * fps)
          const sceneDurationFrames = Math.round((scene.end - scene.start) * fps)
          
          // skip invalid scenes
          if (sceneDurationFrames <= 0) return null
          
          return (
            <Sequence
              key={i}
              from={sceneStartFrame}
              durationInFrames={Math.max(1, sceneDurationFrames)}
            >
              <SceneRenderer 
                scene={scene} 
                fps={fps} 
                sceneStartFrame={sceneStartFrame}
              />
              {/* show transcript text as subtitle if available */}
              {scene.text && (
                <SimpleTextOverlay text={scene.text} />
              )}
            </Sequence>
          )
        })
      ) : (
        // no scenes - just show a basic overlay
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)'
        }}>
          <p style={{ color: 'white', fontSize: 32 }}>
            {manifest.mode?.toUpperCase() || 'VIDEO'} MODE
          </p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
